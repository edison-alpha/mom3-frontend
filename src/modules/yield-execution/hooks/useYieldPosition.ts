"use client";

import * as React from "react";

import type { YieldPosition } from "@/modules/yield-execution/types/yield-execution.types";

export function useYieldPosition(marketId?: string, account?: string | null) {
  const [data, setData] = React.useState<YieldPosition | null>(null);
  const [isLoading, setIsLoading] = React.useState(Boolean(marketId && account));
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!marketId || !account) {
      setData(null);
      setIsLoading(false);
      return null;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ account });
      const response = await fetch(
        `/api/ai/markets/${encodeURIComponent(marketId)}/position?${params}`,
        { cache: "no-store" },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.error || "Position data is unavailable.");
      setData(payload as YieldPosition);
      setError(null);
      return payload as YieldPosition;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Position data is unavailable.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, marketId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
