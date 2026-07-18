"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { getRecentRecipients, saveRecentRecipient } from "@/modules/send/api/recent-recipients.api";
import { resolveUsername } from "@/modules/username/utils/username.api";
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
  const saveRecipientMutation = useMutation({
    mutationKey: ["recipients", "save"],
    mutationFn: ({ recipient, chainId }: { recipient: Recipient; chainId?: number }) => saveRecentRecipient(accountInfo.ownerAddress, recipient, chainId),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["recipients", "recent", accountInfo.ownerAddress || null] }); },
  });
  const recentRecipients = recentRecipientsQuery.data || [];
  const usernameSearch = query.trim().replace(/^@/, "").toLowerCase();
  const usernameQuery = useQuery({
    queryKey: ["username", "search", usernameSearch, Number(initialChain) || DEFAULT_CHAIN_ID],
    queryFn: () => resolveUsername(usernameSearch, Number(initialChain) || DEFAULT_CHAIN_ID),
    enabled: /^[a-z0-9_]{3,20}$/.test(usernameSearch),
    staleTime: 60_000,
    retry: false,
  });
  const usernameRecipient = React.useMemo(() => {
    const identity = usernameQuery.data;
    if (!identity?.address) return null;
    return {
      id: identity.username,
      handle: identity.username,
      name: "mom3 user",
      address: identity.address,
      network: initialChain || "Universal",
      status: "Verified" as const,
      color: "from-[#3B33BD] to-[#7E78EA]",
      avatarUrl: identity.avatar_url,
    };
  }, [initialChain, usernameQuery.data]);

  /* â”€â”€ Derived token rows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const tokenRows = React.useMemo(
    () => normalizePrimaryAssetTokens(primaryAssets, true),
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
    if (!query.trim()) return recentRecipients;

    const combined = recentRecipients.filter(
      (recipient, index, self) =>
        index === self.findIndex((item) => item.address === recipient.address),
    );
    const filtered = combined.filter((recipient) => matchesRecipient(recipient, query));

    if (usernameRecipient) return [usernameRecipient, ...filtered.filter((item) => item.address !== usernameRecipient.address)];
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
    if (usernameRecipient) return;
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
    isSearchingUsername: usernameQuery.isFetching && !usernameRecipient,
    canSend,
    // actions
    resetCompose,
    goBack,
    selectRecipient,
    selectToken,
    handleSearchSubmit,
    handleAmountChange,
    handleMaxAmount,
  };
}
