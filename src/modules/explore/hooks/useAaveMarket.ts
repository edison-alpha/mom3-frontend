"use client";

import * as React from "react";

import type { TimeRange } from "@/components/ui/mini-chart";

export type AaveMarketData = {
  chainId: number;
  network: string;
  apy: number;
  tvl: number;
  utilization: number;
  aTokenAddress: string;
  wallet: { usdc: number; aUsdc: number };
  chart: Record<TimeRange, number[]>;
  lastUpdated: string;
  source: string;
};

export function useAaveMarket(account?: string, chainId = 42161, enabled = true) {
  const [data, setData] = React.useState<AaveMarketData | null>(null);
  const [isLoading, setIsLoading] = React.useState(enabled);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return null;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ chainId: String(chainId) });
      if (account) params.set("account", account);
      const response = await fetch(`/api/aave/market?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Aave market data unavailable.");
      setData(payload);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Aave market data unavailable.");
    } finally {
      setIsLoading(false);
    }
  }, [account, chainId, enabled]);

  React.useEffect(() => {
    if (!enabled) return;
    void refresh();
    const timer = window.setInterval(() => void refresh(), 300_000);
    return () => window.clearInterval(timer);
  }, [enabled, refresh]);

  return { data, error, isLoading, refresh };
}
