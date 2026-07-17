"use client";

import { useEffect, useState } from "react";

import { portfolioModes } from "../constants/dashboard";
import type { CurrencyCode } from "../types/dashboard.types";
import { formatCurrency } from "../utils/formatCurrency";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { usePortfolioPerformance } from "./usePortfolioPerformance";

export function useDashboardViewModel() {
  const {
    isLoading: isUniversalAccountLoading,
    primaryAssets,
  } = useUniversalAccount();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedMode = window.localStorage.getItem("mom3-risk-tolerance");
    const savedIndex = savedMode === "aggressive" ? 0 : savedMode === "conservative" ? 2 : 1;
    setActiveModeIndex(savedIndex);
  }, []);

  const activeMode = portfolioModes[activeModeIndex] ?? portfolioModes[0];
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

  function handleSelectMode(index: number) {
    setActiveModeIndex(index);
    const riskTolerance = index === 0 ? "aggressive" : index === 2 ? "conservative" : "moderate";
    window.localStorage.setItem("mom3-risk-tolerance", riskTolerance);
  }

  return {
    activeMode,
    activeModeIndex,
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
    performanceHasRealData: Boolean(performance.data?.has_real_data),
    isPerformanceLoading: performance.isLoading,
    handleSelectCurrency,
    handleSelectMode,
    handleToggleBalance,
    handleToggleCurrencyMenu,
  };
}
