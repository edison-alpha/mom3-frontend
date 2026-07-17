"use client";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { CHAIN_ID } from "@particle-network/universal-account-sdk";

import {
  addressBook,
  recentRecipients,
  scannedRecipient,
} from "@/modules/send/constants/send.constants";
import type { Recipient, SendPreview, SendStatus, TokenRow } from "@/modules/send/types/send.types";
import {
  findPreferredToken,
  getAmountValidationMessage,
  getSendErrorMessage,
  isRetryableParticleTransactionError,
  isRecipientValidForToken,
  isTransactionQuoteExpired,
  isUserRejectedError,
  matchesAsset,
  normalizeAssetQuery,
  resolveRecipient,
  normalizePrimaryAssetTokens,
  ZERO_ADDRESS,
} from "@/modules/send/utils/send.utils";
import { prepareSponsoredTransaction } from "@/providers/universal-account/utils/gas-sponsorship.utils";
import { syncHistory } from "@/modules/history/api/history.api";

export function useConfirmPaymentState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const to = searchParams.get("to") ?? "";
  const asset = searchParams.get("asset") ?? "";
  const chain = searchParams.get("chain") ?? "";
  const amount = searchParams.get("amount") ?? "";

  const {
    universalAccount,
    accountInfo,
    primaryAssets,
    isLoading,
    error: accountError,
    ensureDelegated,
    refreshAccount,
    signAndSend,
  } = useUniversalAccount();

  const [sendStatus, setSendStatus] = React.useState<SendStatus>("idle");
  const [sendPreview, setSendPreview] = React.useState<SendPreview | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const submitInFlightRef = React.useRef(false);

  const tokenRows = React.useMemo(
    () => normalizePrimaryAssetTokens(primaryAssets),
    [primaryAssets],
  );

  const totalPrimaryAssetsInUSD =
    primaryAssets && "totalAmountInUSD" in primaryAssets
      ? Number(primaryAssets.totalAmountInUSD || 0)
      : null;

  const selectedToken = React.useMemo(
    () => findPreferredToken(tokenRows, asset, chain),
    [tokenRows, asset, chain],
  );

  const numericAmount = React.useMemo(() => Number(amount), [amount]);
  const amountValidationMessage = React.useMemo(
    () => getAmountValidationMessage(amount, selectedToken, totalPrimaryAssetsInUSD),
    [amount, selectedToken, totalPrimaryAssetsInUSD],
  );

  const [recipient, setRecipient] = React.useState<Recipient | null>(null);

  React.useEffect(() => {
    const resolved = resolveRecipient(to);
    if (resolved) {
      setRecipient(resolved);
    }
  }, [to]);

  const prepareTransaction = React.useCallback(async () => {
    if (!universalAccount || !recipient || !selectedToken) return;

    if (!isRecipientValidForToken(recipient, selectedToken)) {
      setError(
        selectedToken.chainId === CHAIN_ID.SOLANA_MAINNET
          ? "Enter a valid Solana address for this asset."
          : "Enter a valid EVM address for this asset.",
      );
      return;
    }

    if (amountValidationMessage || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(amountValidationMessage ?? "Enter a valid amount.");
      return;
    }

    setError(null);
    setNotice(null);
    setSendStatus("preparing");

    try {
      const particleTransaction = await universalAccount.createTransferTransaction({
        token: {
          chainId: selectedToken.chainId,
          address: selectedToken.tokenAddress,
        },
        amount: amount.trim(),
        receiver: recipient.address,
      });
      const transaction = prepareSponsoredTransaction(particleTransaction);

      if (!transaction.transactionId || !transaction.rootHash || transaction.userOps.length === 0) {
        throw new Error("Particle returned an incomplete transfer quote.");
      }

      setSendPreview({
        transaction,
        amount: amount.trim(),
        token: selectedToken,
        recipient,
      });
    } catch (cause) {
      if (!isUserRejectedError(cause)) {
        setError(getSendErrorMessage(cause));
      }
    } finally {
      setSendStatus("idle");
    }
  }, [
    universalAccount,
    recipient,
    selectedToken,
    amount,
    numericAmount,
    amountValidationMessage,
  ]);

  React.useEffect(() => {
    if (!recipient || !selectedToken || sendPreview || sendStatus !== "idle") return;
    void prepareTransaction();
  }, [recipient, selectedToken, sendPreview, sendStatus, prepareTransaction]);

  const handleConfirmSend = async () => {
    // Particle transaction records are single-use. Prevent a double click or
    // a second render event from submitting the same transactionId twice.
    if (submitInFlightRef.current) return;

    if (!sendPreview) {
      await prepareTransaction();
      return;
    }

    if (isTransactionQuoteExpired(sendPreview.transaction)) {
      setSendPreview(null);
      await prepareTransaction();
      setNotice("The quote expired. Review the refreshed transaction details and confirm again.");
      return;
    }

    submitInFlightRef.current = true;
    setError(null);
    setNotice(null);

    try {
      const isNativeEvmAsset =
        sendPreview.token.chainId !== CHAIN_ID.SOLANA_MAINNET &&
        sendPreview.token.tokenAddress.toLowerCase() === ZERO_ADDRESS;

      if (isNativeEvmAsset) {
        setSendStatus("delegating");
        const didDelegate = await ensureDelegated(sendPreview.token.chainId);

        if (didDelegate) {
          setSendPreview(null);
          await prepareTransaction();
          setNotice(
            "EIP-7702 upgrade completed. Review the refreshed quote and confirm again.",
          );
          return;
        }
      }

      setSendStatus("signing");
      // Particle injects signatures into the transaction object before submit.
      // Keep React state immutable so a retry never resubmits a mutated quote.
      const transactionForSubmit = structuredClone(sendPreview.transaction);
      const result = await signAndSend(transactionForSubmit);
      setTransactionId(result.transactionId ?? sendPreview.transaction.transactionId);
      const account = accountInfo.evmSmartAccount || accountInfo.ownerAddress;
      if (account && universalAccount) {
        void universalAccount.getTransactions(1, 50).then((response: any) => {
          const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
          return syncHistory(account, transactions);
        }).catch(() => undefined);
      }
      await refreshAccount();
    } catch (cause) {
      if (isRetryableParticleTransactionError(cause)) {
        setSendPreview(null);
        await prepareTransaction();
        setError(getSendErrorMessage(cause));
      } else {
        setError(getSendErrorMessage(cause));
      }
    } finally {
      submitInFlightRef.current = false;
      setSendStatus("idle");
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams();
    if (to) params.set("to", to);
    if (asset) params.set("asset", asset);
    if (chain) params.set("chain", chain);
    if (amount) params.set("amount", amount);
    router.push(`/send?${params.toString()}`);
  };

  const handleSendAgain = () => {
    const params = new URLSearchParams();
    if (recipient?.address) params.set("to", recipient.address);
    if (selectedToken?.symbol) params.set("asset", selectedToken.symbol);
    if (selectedToken?.chainName) params.set("chain", selectedToken.chainName);
    router.push(`/send?${params.toString()}`);
  };

  const handleSuccessBack = () => router.push("/dashboard");

  const handleRetry = async () => {
    setError(null);
    setNotice(null);
    if (!sendPreview) await prepareTransaction();
  };

  const isReady = Boolean(recipient && selectedToken && !isLoading && !amountValidationMessage);
  const isSigning = sendStatus === "signing";
  const isPreparing = sendStatus === "preparing" || sendStatus === "delegating";

  return {
    to,
    asset,
    chain,
    amount,
    recipient,
    selectedToken,
    sendPreview,
    transactionId,
    error,
    notice,
    accountError,
    isLoading,
    isReady,
    isSigning,
    isPreparing,
    totalPrimaryAssetsInUSD,
    amountValidationMessage,
    handleConfirmSend,
    handleBack,
    handleSendAgain,
    handleSuccessBack,
    handleRetry,
    refreshAccount,
  };
}
