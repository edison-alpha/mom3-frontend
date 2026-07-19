"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { clearRecentRecipients, getRecentRecipients, saveRecentRecipient } from "@/modules/send/api/recent-recipients.api";
import { getMyUsername, searchUsernames } from "@/modules/username/utils/username.api";
import { formatUsername } from "@/lib/username";
import { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";
import type { Recipient, TokenRow } from "@/modules/send/types/send.types";
import {
  findPreferredToken,
  getAmountValidationMessage,
  matchesAsset,
  matchesRecipient,
  normalizeAssetQuery,
  resolveRecipient,
  sanitizeAmountInput,
  normalizePrimaryAssetTokens,
} from "@/modules/send/utils/send.utils";

export function useSendState(
  initialTo: string,
  initialAsset: string,
  initialChain: string,
  initialAmount = "",
) {
  const {
    universalAccount,
    accountInfo,
    primaryAssets,
    isLoading,
    error: accountError,
    refreshAccount,
  } = useUniversalAccount();

  const [query, setQuery] = React.useState(initialTo);
  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient | null>(null);
  const [selectedTokenId, setSelectedTokenId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState(() => sanitizeAmountInput(initialAmount));
  const [step, setStep] = React.useState<"recipient" | "token" | "amount">("recipient");
  const [error, setError] = React.useState<string | null>(null);
  const appliedInitialAsset = React.useRef<string | null>(null);
  const queryClient = useQueryClient();
  const recentRecipientsQuery = useQuery({
    queryKey: ["recipients", "recent", accountInfo.ownerAddress || null],
    queryFn: () => getRecentRecipients(accountInfo.ownerAddress as string),
    enabled: Boolean(accountInfo.ownerAddress),
    staleTime: 300_000,
  });
  const myUsernameQuery = useQuery({
    queryKey: ["username", "owner", accountInfo.ownerAddress || null],
    queryFn: () => getMyUsername(accountInfo.ownerAddress as string),
    enabled: Boolean(accountInfo.ownerAddress),
    staleTime: 300_000,
    retry: false,
  });
  const saveRecipientMutation = useMutation({
    mutationKey: ["recipients", "save"],
    mutationFn: ({ recipient, chainId }: { recipient: Recipient; chainId?: number }) => saveRecentRecipient(accountInfo.ownerAddress, recipient, chainId),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["recipients", "recent", accountInfo.ownerAddress || null] }); },
  });
  const recentRecipients = recentRecipientsQuery.data || [];
  const usernameSearch = query.trim().replace(/^@/, "").toLowerCase();
  const requestedChainId = initialChain.toLowerCase() === "solana" ? 101 : Number(initialChain) || DEFAULT_CHAIN_ID;
  const usernameQuery = useQuery({
    queryKey: ["username", "search", usernameSearch, requestedChainId],
    queryFn: () => searchUsernames(usernameSearch, requestedChainId),
    enabled: /^[a-z0-9_]{1,20}$/.test(usernameSearch),
    staleTime: 60_000,
    retry: false,
  });
  const clearRecipientsMutation = useMutation({
    mutationKey: ["recipients", "clear"],
    mutationFn: () => clearRecentRecipients(accountInfo.ownerAddress),
    onSuccess: () => {
      queryClient.setQueryData(["recipients", "recent", accountInfo.ownerAddress || null], []);
    },
  });
  const usernameRecipient = React.useMemo(() => {
    const identities = usernameQuery.data || [];
    return identities.map((identity) => ({
      id: identity.username, handle: formatUsername(identity.username) || identity.username, name: "mom3 user", address: identity.address as string,
      network: requestedChainId === 101 ? "Solana" : initialChain || "Universal", status: "Verified" as const, color: "from-[#3B33BD] to-[#7E78EA]", avatarUrl: identity.avatar_url,
    })).filter((recipient) => Boolean(recipient.address));
  }, [initialChain, requestedChainId, usernameQuery.data]);

  /* â”€â”€ Derived token rows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const tokenRows = React.useMemo(
    () => normalizePrimaryAssetTokens(primaryAssets).filter((token) => token.balance > 0),
    [primaryAssets],
  );

  const totalPrimaryAssetsInUSD =
    primaryAssets && "totalAmountInUSD" in primaryAssets
      ? Number(primaryAssets.totalAmountInUSD || 0)
      : null;

  const selectedToken = React.useMemo(
    () => tokenRows.find((token) => token.id === selectedTokenId) ?? null,
    [selectedTokenId, tokenRows],
  );

  const amountValidationMessage = React.useMemo(
    () => getAmountValidationMessage(amount, selectedToken, totalPrimaryAssetsInUSD),
    [amount, selectedToken, totalPrimaryAssetsInUSD],
  );

  const selectedTokenIsPrefilled = Boolean(
    selectedToken && initialAsset && matchesAsset(selectedToken, initialAsset, initialChain),
  );

  /* â”€â”€ Effects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  React.useEffect(() => {
    if (!initialTo) return;
    const resolved = resolveRecipient(initialTo, recentRecipients);
    if (resolved) {
      setSelectedRecipient(resolved);
      setQuery(resolved.handle.startsWith("@") ? resolved.handle : resolved.address);
      setStep("token");
    }
  }, [initialTo, recentRecipients]);

  React.useEffect(() => {
    if (!selectedRecipient || selectedTokenId || tokenRows.length === 0) return;
    const initialAssetKey = `${normalizeAssetQuery(initialAsset)}:${normalizeAssetQuery(initialChain)}`;
    if (initialAsset && appliedInitialAsset.current === initialAssetKey) return;

    const preferredToken = findPreferredToken(tokenRows, initialAsset, initialChain);
    if (preferredToken) {
      setSelectedTokenId(preferredToken.id);
      setAmount(sanitizeAmountInput(initialAmount));
      setStep("amount");
      if (initialAsset) {
        appliedInitialAsset.current = initialAssetKey;
      }
    }
  }, [initialAmount, initialAsset, initialChain, selectedRecipient, selectedTokenId, tokenRows]);

  /* â”€â”€ Filtered recipients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const filteredRecipients = React.useMemo(() => {
    const recipientKey = (recipient: Recipient) => {
      const handle = recipient.handle.trim().replace(/^@/, "").toLowerCase();
      return handle && handle !== recipient.address.trim().toLowerCase()
        ? `username:${handle}`
        : `address:${recipient.address.trim().toLowerCase()}`;
    };
    const uniqueByRecipient = (items: Recipient[]) => items.filter(
      (recipient, index, self) => index === self.findIndex((item) => recipientKey(item) === recipientKey(recipient)),
    );

    if (!query.trim()) return uniqueByRecipient(recentRecipients);

    const combined = uniqueByRecipient(recentRecipients);
    const filtered = combined.filter((recipient) => matchesRecipient(recipient, query));

    if (usernameRecipient.length > 0) {
      const usernameResults = uniqueByRecipient(usernameRecipient);
      const usernameKeys = new Set(usernameResults.map(recipientKey));
      return [...usernameResults, ...filtered.filter((item) => !usernameKeys.has(recipientKey(item)))];
    }
    if (filtered.length > 0) return filtered;

    const resolved = resolveRecipient(query, recentRecipients);
    return resolved ? [resolved] : [];
  }, [query, recentRecipients, usernameRecipient]);

  const showRecentLabel = !query.trim() && recentRecipients.length > 0;

  /* â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const resetCompose = () => {
    setSelectedRecipient(null);
    setSelectedTokenId(null);
    setAmount("");
    setError(null);
    setStep("recipient");
    setQuery("");
  };

  const goBack = () => {
    if (step === "amount") {
      setAmount("");
      setStep("token");
    } else if (step === "token") {
      setSelectedRecipient(null);
      setSelectedTokenId(null);
      setAmount("");
      setQuery("");
      setStep("recipient");
    } else {
      resetCompose();
    }
    setError(null);
  };

  const selectRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setSelectedTokenId(null);
    setAmount("");
    setError(null);
    setStep("token");
    setQuery(recipient.handle.startsWith("@") ? recipient.handle : recipient.address);
    queryClient.setQueryData<Recipient[]>(["recipients", "recent", accountInfo.ownerAddress || null], (current = []) => [
      { ...recipient, status: "Recent" as const },
      ...current.filter((item) => item.address.toLowerCase() !== recipient.address.toLowerCase()),
    ].slice(0, 20));
    void saveRecipientMutation.mutateAsync({ recipient });
  };

  const selectToken = (token: TokenRow) => {
    if (selectedRecipient?.handle.startsWith("@")) {
      const identity = (usernameQuery.data || []).find((item) => item.username.toLowerCase() === selectedRecipient.handle.toLowerCase());
      const chainAddress = identity?.addresses?.[String(token.chainId)] || (token.chainId === 101 ? null : identity?.address);
      if (chainAddress) {
        setSelectedRecipient({ ...selectedRecipient, address: chainAddress, network: token.chainName });
      }
    }
    setSelectedTokenId(token.id);
    setAmount("");
    setError(null);
    setStep("amount");
  };

  const handleSearchSubmit = async () => {
    const resolved = resolveRecipient(query, recentRecipients);
    if (resolved) {
      selectRecipient(resolved);
      return;
    }
    if (usernameRecipient.length > 0) return;
    if (!resolved) {
      setError("Recipient not found. Enter a valid mom3 tag or wallet address.");
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(sanitizeAmountInput(value));
    setError(null);
  };

  const handleMaxAmount = () => {
    if (!selectedToken) return;
    setAmount(selectedToken.balance.toString());
  };

  const canSend = Boolean(
    myUsernameQuery.data?.username &&
    selectedRecipient &&
      selectedToken &&
      universalAccount &&
      Number(amount) > 0 &&
      !amountValidationMessage,
  );

  return {
    // account
    universalAccount,
    primaryAssets,
    isLoading,
    accountError,
    refreshAccount,
    hasUsername: Boolean(myUsernameQuery.data?.username),
    isUsernameLoading: myUsernameQuery.isPending,
    // state
    query,
    setQuery,
    selectedRecipient,
    selectedToken,
    selectedTokenId,
    amount,
    step,
    error,
    setError,
    // derived
    tokenRows,
    totalPrimaryAssetsInUSD,
    amountValidationMessage,
    selectedTokenIsPrefilled,
    filteredRecipients,
    showRecentLabel,
    isSearchingUsername: usernameQuery.isFetching && usernameSearch.length > 0,
    canSend,
    // actions
    resetCompose,
    goBack,
    selectRecipient,
    selectToken,
    handleSearchSubmit,
    handleAmountChange,
    handleMaxAmount,
    clearRecentRecipients: () => clearRecipientsMutation.mutateAsync(),
    isClearingRecentRecipients: clearRecipientsMutation.isPending,
  };
}
