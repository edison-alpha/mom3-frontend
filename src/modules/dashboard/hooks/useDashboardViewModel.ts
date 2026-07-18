"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { CurrencyCode } from "../types/dashboard.types";
import { formatCurrency } from "../utils/formatCurrency";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { usePortfolioPerformance } from "./usePortfolioPerformance";
import { getMyUsername } from "@/modules/username/utils/username.api";

export function useDashboardViewModel() {
  const {
    isLoading: isUniversalAccountLoading,
    primaryAssets,
    accountInfo,
  } = useUniversalAccount();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const usernameQuery = useQuery({
    queryKey: ["username", "owner", accountInfo.ownerAddress || null],
    queryFn: () => getMyUsername(accountInfo.ownerAddress as string),
    enabled: Boolean(accountInfo.ownerAddress),
    staleTime: 300_000,
  });
  const username = usernameQuery.data?.username || null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const balanceValue =
    primaryAssets && "totalAmountInUSD" in primaryAssets
      ? Number(primaryAssets.totalAmountInUSD || 0)
      : 0;
  const hasAssets = balanceValue > 0;
  const performance = usePortfolioPerformance(balanceValue);
  const pnlValue = performance.data?.net_usd ?? 0;
  const balanceDisplay = formatCurrency(balanceValue, currency);
  const pnlDisplay = formatCurrency(Math.abs(pnlValue), currency);
  const isBalanceLoading = mounted && isUniversalAccountLoading && primaryAssets === null;
  const isInitialLoading = isUniversalAccountLoading && primaryAssets === null;

  function handleToggleBalance() {
    setBalanceHidden((value) => !value);
  }

  function handleToggleCurrencyMenu() {
    setCurrencyOpen((value) => !value);
  }

  function handleSelectCurrency(code: CurrencyCode) {
    setCurrency(code);
    setCurrencyOpen(false);
  }

  return {
    balanceDisplay,
    balanceHidden,
    balanceValue,
    currency,
    currencyOpen,
    hasAssets,
    isBalanceLoading,
    isInitialLoading,
    mounted,
    pnlDisplay,
    pnlValue,
    pnlPercent: performance.data?.change_percent ?? 0,
    username,
    isUsernameLoading: usernameQuery.isPending,
    performanceHasRealData: Boolean(performance.data?.has_real_data),
    isPerformanceLoading: performance.isLoading,
    handleSelectCurrency,
    handleToggleBalance,
    handleToggleCurrencyMenu,
  };
}
