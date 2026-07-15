"use client";

import * as React from "react";

import type { TokenRow } from "@/modules/send/types/send.types";
import type { PortfolioPreferences } from "@/modules/assets/types/portfolio.types";

const STORAGE_KEY = "mom3.assets.preferences.v1";
const DEFAULT_PREFERENCES: PortfolioPreferences = {
  hideZeroBalances: true,
  hiddenAssetIds: [],
};

function readPreferences(): PortfolioPreferences {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored) as Partial<PortfolioPreferences>;
    return {
      hideZeroBalances: parsed.hideZeroBalances !== false,
      hiddenAssetIds: Array.isArray(parsed.hiddenAssetIds)
        ? parsed.hiddenAssetIds.filter((item): item is string => typeof item === "string")
        : [],
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function usePortfolioPreferences(tokens: TokenRow[]) {
  const [preferences, setPreferences] = React.useState<PortfolioPreferences>(DEFAULT_PREFERENCES);

  React.useEffect(() => {
    setPreferences(readPreferences());
  }, []);

  const updatePreferences = React.useCallback((next: PortfolioPreferences) => {
    setPreferences(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The preference remains valid for this session if storage is unavailable.
    }
  }, []);

  const hiddenAssetIds = React.useMemo(
    () => new Set(preferences.hiddenAssetIds),
    [preferences.hiddenAssetIds],
  );
  const visibleTokens = React.useMemo(
    () => tokens.filter((token) => {
      if (hiddenAssetIds.has(token.id)) return false;
      if (preferences.hideZeroBalances && token.balance <= 0 && token.amountInUSD <= 0) return false;
      return true;
    }),
    [hiddenAssetIds, preferences.hideZeroBalances, tokens],
  );

  const setHideZeroBalances = React.useCallback((value: boolean) => {
    updatePreferences({ ...preferences, hideZeroBalances: value });
  }, [preferences, updatePreferences]);

  const toggleAsset = React.useCallback((assetId: string) => {
    const next = new Set(preferences.hiddenAssetIds);
    if (next.has(assetId)) next.delete(assetId);
    else next.add(assetId);
    updatePreferences({ ...preferences, hiddenAssetIds: Array.from(next) });
  }, [preferences, updatePreferences]);

  const showAllAssets = React.useCallback(() => {
    updatePreferences({ ...preferences, hiddenAssetIds: [] });
  }, [preferences, updatePreferences]);

  return {
    visibleTokens,
    allTokens: tokens,
    hideZeroBalances: preferences.hideZeroBalances,
    hiddenAssetIds,
    setHideZeroBalances,
    toggleAsset,
    showAllAssets,
  };
}
