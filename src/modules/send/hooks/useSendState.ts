"use client";

import * as React from "react";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import {
  recentRecipients,
  addressBook,
  scannedRecipient,
} from "@/modules/send/constants/send.constants";
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
    primaryAssets,
    isLoading,
    error: accountError,
    refreshAccount,
  } = useUniversalAccount();

  const [query, setQuery] = React.useState(initialTo);
  const [selectedRecipient, setSelectedRecipient] = React.useState<Recipient | null>(null);
  const [selectedTokenId, setSelectedTokenId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState(() => sanitizeAmountInput(initialAmount));
  const [scanOpen, setScanOpen] = React.useState(false);
  const [step, setStep] = React.useState<"recipient" | "token" | "amount">("recipient");
  const [error, setError] = React.useState<string | null>(null);
  const appliedInitialAsset = React.useRef<string | null>(null);

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
    const resolved = resolveRecipient(initialTo);
    if (resolved) {
      setSelectedRecipient(resolved);
      setQuery(resolved.handle.startsWith("@") ? resolved.handle : resolved.address);
      setStep("token");
    }
  }, [initialTo]);

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

  React.useEffect(() => {
    if (!scanOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setScanOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [scanOpen]);

  /* â”€â”€ Filtered recipients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const filteredRecipients = React.useMemo(() => {
    if (!query.trim()) return recentRecipients;

    const combined = [...recentRecipients, ...addressBook].filter(
      (recipient, index, self) =>
        index === self.findIndex((item) => item.handle === recipient.handle),
    );
    const filtered = combined.filter((recipient) => matchesRecipient(recipient, query));

    if (filtered.length > 0) return filtered;

    const resolved = resolveRecipient(query);
    return resolved ? [resolved] : [];
  }, [query]);

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
  };

  const selectToken = (token: TokenRow) => {
    setSelectedTokenId(token.id);
    setAmount("");
    setError(null);
    setStep("amount");
  };

  const handleScan = () => {
    setScanOpen(false);
    selectRecipient(scannedRecipient);
  };

  const handleSearchSubmit = () => {
    const resolved = resolveRecipient(query);
    if (!resolved) {
      setError("Recipient not found. Enter a valid mom3 tag or wallet address.");
      return;
    }
    selectRecipient(resolved);
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
    scanOpen,
    setScanOpen,
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
    canSend,
    // actions
    resetCompose,
    goBack,
    selectRecipient,
    selectToken,
    handleScan,
    handleSearchSubmit,
    handleAmountChange,
    handleMaxAmount,
  };
}
