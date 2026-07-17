"use client";

import * as React from "react";

import { formatUsdValue } from "@/lib/format";
import type { MarketDetail, Risk } from "@/lib/portfolio-data";
import type { TimeRange } from "@/components/ui/mini-chart";
import { useRealtime } from "@/providers/realtime/components/RealtimeProvider";
import { getMarketDetail } from "@/modules/markets/api/markets.api";

type CatalogMarket = {
  market_id?: string;
  pool_id?: string;
  protocol?: string;
  symbol?: string;
  asset?: string;
  chain?: string;
  chain_id?: number;
  apy?: number;
  apy_base?: number;
  apy_reward?: number;
  apy_change_1d?: number;
  apy_change_7d?: number;
  apy_change_30d?: number;
  tvl?: number;
  risk_score?: number;
  opportunity_score?: number;
  stablecoin?: boolean;
  exposure?: string | null;
  impermanent_loss?: boolean | null;
  prediction?: { class?: string | null; probability?: number };
  execution?: {
    enabled?: boolean;
    actions?: Array<"supply" | "withdraw">;
    type?: string | null;
    requires_user_confirmation?: boolean;
    uses_eip7702?: boolean;
    contract?: string | null;
    asset_address?: string | null;
    asset_decimals?: number | null;
    position_symbol?: string | null;
  };
  source?: string;
  source_url?: string;
};

function riskLabel(score: number): Risk {
  if (score >= 6.5) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

const emptyChart = (): Record<TimeRange, number[]> => ({ "1D": [], "1W": [], "1M": [], "1Y": [] });

function chartRanges(values: number[]): Record<TimeRange, number[]> {
  const take = (size: number) => values.slice(-size).filter(Number.isFinite);
  return { "1D": take(2), "1W": take(7), "1M": take(30), "1Y": take(365) };
}

export function useYieldMarketDetail(seed: MarketDetail, marketId?: string) {
  const { marketRevision } = useRealtime();
  const [market, setMarket] = React.useState(seed);
  const [metadata, setMetadata] = React.useState({
    source: seed.protocol.toLowerCase().includes("aave") ? "Aave on-chain" : "Live catalog",
    lastUpdated: null as string | null,
    executionEnabled: false,
    apyBase: null as number | null,
    apyReward: null as number | null,
    change1d: null as number | null,
    change7d: null as number | null,
    change30d: null as number | null,
    riskScore: null as number | null,
    opportunityScore: null as number | null,
    predictionClass: null as string | null,
    predictionProbability: null as number | null,
    stablecoin: null as boolean | null,
    exposure: null as string | null,
    impermanentLoss: null as boolean | null,
    executionAction: null as string | null,
    executionActions: [] as Array<"supply" | "withdraw">,
    executionType: null as string | null,
    executionAssetSymbol: seed.asset,
    positionSymbol: null as string | null,
    requiresConfirmation: null as boolean | null,
    usesEip7702: null as boolean | null,
    contract: null as string | null,
    assetAddress: null as string | null,
    assetDecimals: null as number | null,
    sourceUrl: null as string | null,
    currentTvl: null as number | null,
    tvlChart: emptyChart(),
  });
  const [isLoading, setIsLoading] = React.useState(Boolean(marketId));
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!marketId) return;
    setIsLoading(true);
    try {
      const payload = await getMarketDetail(marketId);
      const live: CatalogMarket | null = payload.market && typeof payload.market === "object" ? payload.market : null;
      if (!live) throw new Error("This pool is no longer present in the live market catalog.");

      let executionEnabled = live.execution?.enabled === true;
      try {
        const allowlistResponse = await fetch(
          `/api/ai/execution-markets/${encodeURIComponent(marketId)}`,
          { cache: "no-store" },
        );
        const allowlistPayload = await allowlistResponse.json().catch(() => ({}));
        executionEnabled = executionEnabled || (allowlistResponse.ok && allowlistPayload.allowlisted === true);
      } catch {
        // Execution stays disabled when the backend policy cannot be verified.
      }

      const apy = Number(live.apy || 0);
      const riskScore = Number(live.risk_score || 5);
      let apyChart = emptyChart();
      let tvlChart = emptyChart();
      try {
        const points = Array.isArray(payload.chart) ? payload.chart : [];
        const ordered = points
          .map((point: { timestamp?: string; apy?: number; tvlUsd?: number }) => ({
            timestamp: new Date(point.timestamp || 0).getTime(),
            apy: Number(point.apy),
            tvl: Number(point.tvlUsd),
          }))
          .filter((point: { timestamp: number }) => Number.isFinite(point.timestamp))
          .sort((left: { timestamp: number }, right: { timestamp: number }) => left.timestamp - right.timestamp);
        apyChart = chartRanges(ordered.map((point: { apy: number }) => point.apy));
        tvlChart = chartRanges(ordered.map((point: { tvl: number }) => point.tvl));
      } catch {
        // Historical chart is optional; current live metrics still render.
      }
      setMarket((current) => ({
        ...current,
        asset: live.symbol || live.asset || current.asset,
        protocol: live.protocol || current.protocol,
        chainId: Number(live.chain_id || current.chainId),
        primary: `${apy.toFixed(2)}% APY`,
        secondary: live.chain || current.secondary,
        tvl: formatUsdValue(Number(live.tvl || 0)),
        utilization: `${Number(live.apy_change_7d || 0) >= 0 ? "+" : ""}${Number(live.apy_change_7d || 0).toFixed(2)}% 7d`,
        risk: riskLabel(riskScore),
        description: `Live ${live.symbol || live.asset || current.asset} market on ${live.protocol || current.protocol}. TVL, APY, and risk are refreshed from the market catalog.`,
        chartData: apyChart,
      }));
      setMetadata({
        source: live.source || "defillama-live",
        lastUpdated: payload.timestamp || new Date().toISOString(),
        executionEnabled,
        apyBase: Number(live.apy_base ?? 0),
        apyReward: Number(live.apy_reward ?? 0),
        change1d: Number(live.apy_change_1d ?? 0),
        change7d: Number(live.apy_change_7d ?? 0),
        change30d: Number(live.apy_change_30d ?? 0),
        riskScore,
        opportunityScore: Number(live.opportunity_score ?? 0),
        predictionClass: live.prediction?.class || null,
        predictionProbability: Number(live.prediction?.probability ?? 0),
        stablecoin: live.stablecoin ?? null,
        exposure: live.exposure || null,
        impermanentLoss: live.impermanent_loss ?? null,
        executionAction: live.execution?.actions?.[0] || null,
        executionActions: live.execution?.actions || [],
        executionType: live.execution?.type || null,
        executionAssetSymbol: live.asset || "USDC",
        positionSymbol: live.execution?.position_symbol || null,
        requiresConfirmation: live.execution?.requires_user_confirmation ?? null,
        usesEip7702: live.execution?.uses_eip7702 ?? null,
        contract: live.execution?.contract || null,
        assetAddress: live.execution?.asset_address || null,
        assetDecimals: live.execution?.asset_decimals ?? null,
        sourceUrl: live.source_url || null,
        currentTvl: Number(live.tvl ?? 0),
        tvlChart,
      });
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Live market data is unavailable.");
    } finally {
      setIsLoading(false);
    }
  }, [marketId, seed.chainId]);

  React.useEffect(() => {
    void refresh();
  }, [marketRevision, refresh]);

  return { market, metadata, isLoading, error, refresh };
}
