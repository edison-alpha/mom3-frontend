"use client";

import { useQuery } from "@tanstack/react-query";

import type { YieldPosition } from "@/modules/yield-execution/types/yield-execution.types";

export const yieldPositionQueryKeys = {
  position: (marketId?: string, account?: string | null, chainId?: number) =>
    ["yield-position", marketId || null, account || null, chainId || null] as const,
};

export function useYieldPosition(marketId?: string, account?: string | null, chainId?: number) {
  const query = useQuery<YieldPosition>({
    queryKey: yieldPositionQueryKeys.position(marketId, account, chainId),
    enabled: Boolean(marketId && account && chainId),
    queryFn: async () => {
      const params = new URLSearchParams({ account: account as string });
      const response = await fetch(`/api/ai/markets/${encodeURIComponent(marketId as string)}/position?${params}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.error || "Position data is unavailable.");
      return payload as YieldPosition;
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 5_000),
    refetchOnMount: "always",
    refetchOnReconnect: true,
    staleTime: 30_000,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: async () => (await query.refetch()).data ?? null,
  };
}
