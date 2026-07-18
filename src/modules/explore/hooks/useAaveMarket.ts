"use client";

import { useQuery } from "@tanstack/react-query";

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
  const query = useQuery<AaveMarketData>({
    queryKey: ["aave-market", account || null, chainId],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams({ chainId: String(chainId) });
      if (account) params.set("account", account);
      const response = await fetch(`/api/aave/market?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Aave market data unavailable.");
      return payload as AaveMarketData;
    },
    staleTime: 60_000,
    refetchInterval: enabled ? 300_000 : false,
  });

  return {
    data: query.data ?? null,
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    refresh: query.refetch,
  };
}
