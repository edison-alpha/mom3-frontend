"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getMarketAnalysisPage } from "../api/market-analysis.api";
import type { MarketAnalysisPageParams } from "../types/market-analysis.types";

export function useMarketAnalysisInfinite(params: Omit<MarketAnalysisPageParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["ai-market-analysis", params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getMarketAnalysisPage({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.pagination.has_next ? lastPage.pagination.next_page ?? undefined : undefined,
    staleTime: 60_000,
  });
}
