"use client";

import * as React from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { chainNameFromId } from "@/lib/chain";
import { formatUsdValue } from "@/lib/format";
import { useRealtime } from "@/providers/realtime/components/RealtimeProvider";
import { getMarkets, getTopYields } from "@/modules/markets/api/markets.api";

export type ExploreYieldPool = {
  id: string; asset: string; protocol: string; protocolId?: string; primary: string; secondary: string;
  icon: string; color: string; positive: boolean; category: "Yield" | "Risk"; tvl: string;
  utilization: string; risk: "Low" | "Medium" | "High"; description: string; apy: number; tvlValue: number;
  chainId: number; chain: string; marketId?: string; executionEnabled: boolean; apyChange1d?: number;
  apyChange7d?: number; apyChange30d?: number; opportunityScore?: number; stablecoin: boolean;
  strategy: string; estimatedPnl1dPer1k: number; rank?: number;
};

type YieldMarketEntry = {
  market_id?: string; pool_id?: string; project?: string; protocol?: string; symbol?: string; chain?: string;
  chain_id?: number; apy?: number; apy_change_1d?: number; apy_change_7d?: number; apy_change_30d?: number;
  tvl?: number; stablecoin?: boolean; impermanent_loss?: boolean | null; trend?: string; risk_score?: number;
  opportunity_score?: number; execution?: { enabled?: boolean }; rank?: number;
};

function iconFor(symbol: string) {
  const s = symbol.toLowerCase();
  if (s.includes("usdc")) return "cryptocurrency-color:usdc";
  if (s.includes("usdt")) return "cryptocurrency-color:usdt";
  if (s.includes("eth")) return "cryptocurrency-color:eth";
  if (s.includes("btc")) return "cryptocurrency-color:btc";
  if (s.includes("dai")) return "cryptocurrency-color:dai";
  return "solar:graph-up-bold";
}
function riskFromScore(score: number): ExploreYieldPool["risk"] { return score >= 6.5 ? "High" : score >= 4 ? "Medium" : "Low"; }
function riskScoreFor(protocol: string) { return protocol.toLowerCase().includes("aave") ? 3.2 : protocol.toLowerCase().includes("compound") ? 4 : 5; }
function rankingScore(apy: number, tvl: number, risk: number, opportunity?: number) {
  if (Number.isFinite(opportunity) && Number(opportunity) > 0) return Number(opportunity);
  return apy * Math.max(0.25, 1 - Math.min(Math.max(risk, 0), 10) / 15) + (tvl > 0 ? Math.min(Math.log10(tvl) / 10, 1) : 0);
}

export function useExploreYields(selectedProtocol?: string) {
  const { marketRevision } = useRealtime();
  const [hasMoreByProtocol, setHasMoreByProtocol] = React.useState<Record<string, boolean>>({});
  const [loadingMoreProtocol, setLoadingMoreProtocol] = React.useState<string | null>(null);
  const [extraMarkets, setExtraMarkets] = React.useState<Record<string, ExploreYieldPool[]>>({});
  const queryClient = useQueryClient();

  const mapMarkets = React.useCallback((markets: YieldMarketEntry[]) => markets.flatMap((market) => {
    const protocol = String(market.protocol || "Unknown protocol");
    const symbol = String(market.symbol || "Yield pool");
    const chainId = Number(market.chain_id ?? 0);
    if (!chainId) return [];
    const apy = Number(market.apy ?? 0); const tvl = Number(market.tvl ?? 0);
    const riskScore = Number(market.risk_score ?? riskScoreFor(protocol));
    const isRisk = riskScore >= 6 || market.impermanent_loss === true;
    const stablecoin = market.stablecoin === true;
    return [{
      id: `dl-${protocol}-${chainId}-${market.pool_id || symbol}`, asset: symbol, protocol, protocolId: market.project,
      primary: `${apy.toFixed(2)}% APY`, secondary: market.chain || chainNameFromId(chainId) || "Particle EVM",
      icon: iconFor(symbol), color: "bg-[#2A2A3E]", positive: apy > 0, category: isRisk ? "Risk" : "Yield",
      tvl: tvl > 0 ? formatUsdValue(tvl) : "—", utilization: market.trend || "—", risk: riskFromScore(riskScore),
      description: `Live ${symbol} yield market on ${market.chain || chainNameFromId(chainId) || "Particle EVM"}. Data sourced from the mom3 market catalog.`,
      apy, tvlValue: tvl, chainId, chain: market.chain || chainNameFromId(chainId) || "Particle EVM",
      marketId: market.market_id || market.pool_id, executionEnabled: market.execution?.enabled === true,
      apyChange1d: Number(market.apy_change_1d ?? 0), apyChange7d: Number(market.apy_change_7d ?? 0),
      apyChange30d: Number(market.apy_change_30d ?? 0), opportunityScore: rankingScore(apy, tvl, riskScore, Number(market.opportunity_score)),
      stablecoin, strategy: market.execution?.enabled === true ? (isRisk ? "Growth yield" : stablecoin ? "Stable yield" : "Balanced yield") : "Watch only",
      estimatedPnl1dPer1k: (apy / 100) * 1000 / 365, rank: market.rank,
    }];
  }) as ExploreYieldPool[], []);

  const marketQuery = useQuery({
    queryKey: ["markets", "explore", selectedProtocol || "all", marketRevision],
    queryFn: () => getMarkets({ limit: 10, protocol: selectedProtocol, limitPerProtocol: selectedProtocol === "all" ? 10 : undefined }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const topQuery = useQuery({
    queryKey: ["markets", "top-yields", marketRevision],
    queryFn: () => getTopYields({ limit: 10 }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const pageKey = selectedProtocol || "all";
  const basePools = React.useMemo(
    () => mapMarkets((marketQuery.data?.markets || []) as YieldMarketEntry[]).sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0)),
    [mapMarkets, marketQuery.data],
  );
  const pools = React.useMemo(
    () => [...basePools, ...(extraMarkets[pageKey] || [])].filter((pool, index, list) => list.findIndex((item) => item.id === pool.id) === index),
    [basePools, extraMarkets, pageKey],
  );
  const topYieldPools = React.useMemo(() => mapMarkets((topQuery.data?.markets || []) as YieldMarketEntry[]), [mapMarkets, topQuery.data]);

  const loadMoreProtocol = React.useCallback(async (protocolId: string) => {
    if (loadingMoreProtocol || !hasMoreByProtocol[protocolId]) return;
    setLoadingMoreProtocol(protocolId);
    try {
      const current = pools.filter((pool) => pool.protocolId === protocolId).length;
      const page = Math.floor(current / 10) + 1;
      const response = await queryClient.fetchQuery({
        queryKey: ["markets", "explore-page", protocolId, page, marketRevision],
        queryFn: () => getMarkets({ protocol: protocolId, page, limit: 10 }),
        staleTime: 60_000,
      });
      const nextMarkets = mapMarkets((response.markets || []) as YieldMarketEntry[]);
      setExtraMarkets((previous) => ({ ...previous, [protocolId]: [...(previous[protocolId] || []), ...nextMarkets] }));
      setHasMoreByProtocol((previous) => ({ ...previous, [protocolId]: response.pagination?.has_next ?? false }));
    } finally { setLoadingMoreProtocol(null); }
  }, [hasMoreByProtocol, loadingMoreProtocol, mapMarkets, marketRevision, pools, queryClient]);

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    if (selectedProtocol === "all" && marketQuery.data?.protocol_totals) {
      for (const [protocol, total] of Object.entries(marketQuery.data.protocol_totals)) next[protocol] = total > 10;
    } else next[pageKey] = marketQuery.data?.pagination?.has_next ?? false;
    setHasMoreByProtocol(next);
  }, [marketQuery.data, pageKey, selectedProtocol]);

  const yieldPools = pools.filter((p) => p.category === "Yield");
  const riskPools = pools.filter((p) => p.category === "Risk");
  const chains = Array.from(new Set(pools.map((p) => p.chainId))).filter(Boolean);
  return {
    pools, yieldPools, riskPools, chains, topYieldPools,
    isLoading: marketQuery.isPending,
    error: marketQuery.error instanceof Error ? marketQuery.error.message : null,
    topError: topQuery.error instanceof Error ? topQuery.error.message : null,
    isTopLoading: topQuery.isPending,
    isFetching: marketQuery.isFetching || topQuery.isFetching,
    hasMoreByProtocol, loadingMoreProtocol, loadMoreProtocol,
  };
}
