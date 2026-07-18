"use client";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { CHAIN_ID } from "@particle-network/universal-account-sdk";

import { getRecentRecipients, saveRecentRecipient } from "@/modules/send/api/recent-recipients.api";
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
} from "@/modules/send/utils/send.utils";
import { syncHistory } from "@/modules/history/api/history.api";
import { resolveUsername } from "@/modules/username/utils/username.api";

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
    let cancelled = false;
    if (to.trim().startsWith("@") && selectedToken) {
      void resolveUsername(to.trim(), selectedToken.chainId).then((identity) => {
        const chainAddress = identity.addresses?.[String(selectedToken.chainId)] || identity.address;
        if (!cancelled && chainAddress) setRecipient({ id: identity.username, handle: identity.username, name: "mom3 user", address: chainAddress, network: selectedToken.chainName, status: "Verified", color: "from-[#3B33BD] to-[#7E78EA]", avatarUrl: identity.avatar_url });
      }).catch(() => { if (!cancelled) setError("Username was not found on the selected chain."); });
    }
    void getRecentRecipients(accountInfo.ownerAddress)
      .catch(() => [])
      .then((recentRecipients) => {
        if (cancelled) return;
        const resolved = resolveRecipient(to, recentRecipients);
        if (resolved) setRecipient(resolved);
      });
    return () => {
      cancelled = true;
    };
  }, [accountInfo.ownerAddress, selectedToken, to]);

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
      // A same-chain transfer must preserve Particle's original transaction
      // exactly. The SDK already returns the correct UserOperation and root
      // hash for direct transfers; rebuilding it as a gasless route can turn
      // an Arb-to-Arb payment into an invalid quote.
      const transaction = {
        ...structuredClone(particleTransaction),
        additionalData: {
          ...particleTransaction.additionalData,
          mom3DirectTransfer: true,
        },
      };

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
      setSendStatus("signing");
      // Particle injects signatures into the transaction object before submit.
      // Keep React state immutable so a retry never resubmits a mutated quote.
      const transactionForSubmit = structuredClone(sendPreview.transaction);
      const result = await signAndSend(transactionForSubmit);
      setTransactionId(result.transactionId ?? sendPreview.transaction.transactionId);
      void saveRecentRecipient(accountInfo.ownerAddress, sendPreview.recipient, sendPreview.token.chainId);
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
        await refreshAccount();
        await prepareTransaction();
        setError(null);
        setNotice("Transaction details have been refreshed. Please review them before confirming.");
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
