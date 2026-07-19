"use client";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";

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
import { getMyUsername, resolveUsername } from "@/modules/username/utils/username.api";
import { formatUsername } from "@/lib/username";

const BSC_MAINNET_CHAIN_ID = 56;

export function useConfirmPaymentState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const to = searchParams.get("to") ?? "";
  const asset = searchParams.get("asset") ?? "";
  const chain = searchParams.get("chain") ?? "";
  const amount = searchParams.get("amount") ?? "";
  const from = searchParams.get("from") === "dashboard" ? "dashboard" : "assets";

  const {
    universalAccount,
    accountInfo,
    primaryAssets,
    isLoading,
    error: accountError,
    refreshAccount,
    signAndSend,
    ensureDelegated,
  } = useUniversalAccount();

  const [sendStatus, setSendStatus] = React.useState<SendStatus>("idle");
  const [sendPreview, setSendPreview] = React.useState<SendPreview | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const submitInFlightRef = React.useRef(false);
  const prepareInFlightRef = React.useRef(false);
  const prepareRequestRef = React.useRef(0);
  const myUsernameQuery = useQuery({
    queryKey: ["username", "owner", accountInfo.ownerAddress || null],
    queryFn: () => getMyUsername(accountInfo.ownerAddress as string),
    enabled: Boolean(accountInfo.ownerAddress),
    staleTime: 300_000,
    retry: false,
  });
  const hasUsername = Boolean(myUsernameQuery.data?.username);

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
  const [isResolvingRecipient, setIsResolvingRecipient] = React.useState(Boolean(to));

  React.useEffect(() => {
    let cancelled = false;
    setIsResolvingRecipient(Boolean(to));
    setRecipient(null);
    const isUsernameLookup = to.trim().startsWith("@");
    if (isUsernameLookup && selectedToken) {
      void resolveUsername(to.trim(), selectedToken.chainId).then((identity) => {
        const chainAddress = identity.addresses?.[String(selectedToken.chainId)]
          || (selectedToken.chainId === CHAIN_ID.SOLANA_MAINNET ? null : identity.address);
        if (!cancelled && chainAddress) setRecipient({ id: identity.username, handle: formatUsername(identity.username) || identity.username, name: "mom3 user", address: chainAddress, network: selectedToken.chainName, status: "Verified", color: "from-[#3B33BD] to-[#7E78EA]", avatarUrl: identity.avatar_url });
      }).catch(() => { if (!cancelled) setError("Username was not found on the selected chain."); })
        .finally(() => { if (!cancelled) setIsResolvingRecipient(false); });
    }
    if (isUsernameLookup) {
      return () => { cancelled = true; };
    }
      void getRecentRecipients(accountInfo.ownerAddress)
      .catch(() => [])
      .then((recentRecipients) => {
        if (cancelled) return;
        const resolved = resolveRecipient(to, recentRecipients);
        if (resolved) setRecipient(resolved);
      })
      .finally(() => { if (!cancelled) setIsResolvingRecipient(false); });
    return () => {
      cancelled = true;
    };
  }, [accountInfo.ownerAddress, selectedToken?.chainId, to]);

  const prepareTransaction = React.useCallback(async () => {
    if (!hasUsername || !universalAccount || !recipient || !selectedToken) return;
    // The confirm page auto-prepares on mount. React may replay effects in
    // development, but a Particle quote is still a remote single-use request.
    if (prepareInFlightRef.current) return;

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

    const requestId = ++prepareRequestRef.current;
    const requestRecipient = recipient;
    const requestToken = selectedToken;
    const requestAmount = amount.trim();
    prepareInFlightRef.current = true;
    setError(null);
    setNotice(null);
    setSendStatus("preparing");

    try {
      const particleTransaction = await universalAccount.createTransferTransaction({
        token: {
          chainId: requestToken.chainId,
          address: requestToken.tokenAddress,
        },
        amount: requestAmount,
        receiver: requestRecipient.address,
      });
      if (requestId !== prepareRequestRef.current) return;
      // Preserve Particle's exact quote. The SDK already includes the final
      // UserOperation, fee route, and root hash for direct transfers.
      const transaction = structuredClone(particleTransaction);

      if (!transaction.transactionId || !transaction.rootHash || transaction.userOps.length === 0) {
        throw new Error("Particle returned an incomplete transfer quote.");
      }

      setSendPreview({
        transaction,
        amount: requestAmount,
        token: requestToken,
        recipient: requestRecipient,
      });
    } catch (cause) {
      if (requestId === prepareRequestRef.current && !isUserRejectedError(cause)) {
        setError(getSendErrorMessage(cause));
      }
    } finally {
      prepareInFlightRef.current = false;
      if (requestId === prepareRequestRef.current) setSendStatus("idle");
    }
  }, [
    universalAccount,
    hasUsername,
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
    if (!hasUsername) return;
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
    let isBscDelegationStep = false;

    try {
      // The upgrade is a real Type-4 wallet transaction, so only request it
      // after the user presses Confirm Payment. A newly delegated BSC wallet
      // must receive a fresh quote before its transfer can be signed.
      if (sendPreview.token.chainId === BSC_MAINNET_CHAIN_ID) {
        isBscDelegationStep = true;
        setSendStatus("delegating");
        const delegatedNow = await ensureDelegated(BSC_MAINNET_CHAIN_ID);
        isBscDelegationStep = false;
        if (delegatedNow) {
          setSendPreview(null);
          await refreshAccount();
          await prepareTransaction();
          setNotice("BNB Chain wallet upgrade is complete. Review the refreshed transaction details before confirming.");
          return;
        }
      }

      setSendStatus("signing");
      // Particle injects signatures into the transaction object before submit.
      // Keep React state immutable so a retry never resubmits a mutated quote.
      const transactionForSubmit = structuredClone(sendPreview.transaction);
      const result = await signAndSend(transactionForSubmit);
      setTransactionId(result.transactionId ?? sendPreview.transaction.transactionId);
      void saveRecentRecipient(accountInfo.ownerAddress, sendPreview.recipient, sendPreview.token.chainId);
      const account = sendPreview.token.chainId === CHAIN_ID.SOLANA_MAINNET
        ? accountInfo.solanaSmartAccount
        : accountInfo.evmSmartAccount || accountInfo.ownerAddress;
      if (account && universalAccount) {
        void universalAccount.getTransactions(1, 50).then((response: any) => {
          const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
          return syncHistory(account, transactions);
        }).catch(() => undefined);
      }
      void refreshAccount();
    } catch (cause) {
      if (!isBscDelegationStep && isRetryableParticleTransactionError(cause)) {
        setSendPreview(null);
        // Never prepare a replacement quote from a stale balance snapshot.
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
    params.set("from", from);
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
    if (!hasUsername) return;
    setError(null);
    setNotice(null);
    // Every re-entry gets a fresh balance and a fresh single-use quote.
    setSendPreview(null);
    await refreshAccount();
    await prepareTransaction();
  };

  const isReady = Boolean(hasUsername && recipient && selectedToken && !isResolvingRecipient && !isLoading && !amountValidationMessage);
  const isSigning = sendStatus === "signing";
  const isPreparing = sendStatus === "preparing" || sendStatus === "delegating";

  return {
    to,
    asset,
    chain,
    amount,
    recipient,
    isResolvingRecipient,
    selectedToken,
    sendPreview,
    transactionId,
    error,
    notice,
    accountError,
    isLoading,
    hasUsername,
    isUsernameLoading: myUsernameQuery.isPending,
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
