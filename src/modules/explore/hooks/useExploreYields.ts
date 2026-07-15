"use client";

import * as React from "react";

import { chainNameFromId } from "@/lib/chain";
import { formatUsdValue } from "@/lib/format";
import { isMvpChainId } from "@/providers/shared/constants/chain.constants";
import { useRealtime } from "@/providers/realtime/components/RealtimeProvider";

export type ExploreYieldPool = {
  id: string;
  asset: string;
  protocol: string;
  primary: string;
  secondary: string;
  icon: string;
  color: string;
  positive: boolean;
  category: "Yield" | "Risk";
  tvl: string;
  utilization: string;
  risk: "Low" | "Medium" | "High";
  description: string;
  apy: number;
  tvlValue: number;
  chainId: number;
  chain: string;
  marketId?: string;
  executionEnabled: boolean;
  apyChange1d?: number;
  apyChange7d?: number;
  apyChange30d?: number;
};

type PulseEntry = {
  protocol?: string;
  pulse_score?: number;
  status?: string;
  tvl?: number;
};

type YieldMarketEntry = {
  market_id?: string;
  pool_id?: string;
  project?: string;
  protocol?: string;
  symbol?: string;
  chain?: string;
  chain_id?: number;
  apy?: number;
  apy_base?: number;
  apy_reward?: number;
  apy_change_1d?: number;
  apy_change_7d?: number;
  apy_change_30d?: number;
  tvl?: number;
  stablecoin?: boolean;
  exposure?: string | null;
  impermanent_loss?: boolean | null;
  source?: string;
  trend?: string;
  risk_score?: number;
  execution?: { enabled?: boolean };
};

// Heuristic token icon/color by symbol keyword.
function iconFor(symbol: string) {
  const s = symbol.toLowerCase();
  if (s.includes("usdc")) return "cryptocurrency-color:usdc";
  if (s.includes("usdt") || s.includes("tether")) return "cryptocurrency-color:usdt";
  if (s.includes("eth")) return "cryptocurrency-color:eth";
  if (s.includes("btc")) return "cryptocurrency-color:btc";
  if (s.includes("dai")) return "cryptocurrency-color:dai";
  if (s.includes("aave")) return "simple-icons:aave";
  if (s.includes("pendle")) return "token-branded:pendle";
  if (s.includes("ethena") || s.includes("usde")) return "token-branded:ethena";
  if (s.includes("morpho")) return "simple-icons:morpho";
  if (s.includes("aerodrome")) return "token-branded:aerodrome";
  if (s.includes("compound")) return "simple-icons:compound";
  return "solar:graph-up-bold";
}

function riskFromScore(score: number): ExploreYieldPool["risk"] {
  if (score >= 6.5) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

const RISK_SCORES: Record<string, number> = {
  aave: 3.2,
  aerodrome: 6.5,
  compound: 4.0,
  moonwell: 4.8,
  seamless: 4.5,
  lido: 3.5,
  curve: 4.2,
  pendle: 6.0,
  morpho: 4.5,
  spark: 4.0,
};

function riskScoreFor(protocol: string) {
  const key = protocol.toLowerCase();
  for (const name of Object.keys(RISK_SCORES)) {
    if (key.includes(name)) return RISK_SCORES[name];
  }
  return 5.0;
}

/**
 * Real cross-chain yield pools curated by Agentkit. The catalog owns protocol
 * discovery and the execution flag, so every card keeps its canonical market ID.
 */
export function useExploreYields() {
  const { marketRevision, marketSnapshot } = useRealtime();
  const [pools, setPools] = React.useState<ExploreYieldPool[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const hasLoadedRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasLoadedRef.current) setIsLoading(true);
      setError(null);
      try {
        const built: ExploreYieldPool[] = [];
        let markets: YieldMarketEntry[];
        if (Array.isArray(marketSnapshot?.markets)) {
          markets = marketSnapshot.markets as YieldMarketEntry[];
        } else {
          const catalogResponse = await fetch("/api/ai/markets", { cache: "no-store" });
          const catalogPayload = await catalogResponse.json().catch(() => ({}));
          if (!catalogResponse.ok) {
            throw new Error(catalogPayload.detail || catalogPayload.error || "Unable to load yield markets.");
          }
          markets = Array.isArray(catalogPayload.markets) ? catalogPayload.markets : [];
        }
        let pulseMap: Record<string, PulseEntry> = {};
        try {
          const pulseResponse = await fetch("/api/ai/pulse", { cache: "no-store" });
          if (pulseResponse.ok) {
            const pulsePayload = await pulseResponse.json();
            const protocols: PulseEntry[] = Array.isArray(pulsePayload.protocols) ? pulsePayload.protocols : [];
            pulseMap = Object.fromEntries(protocols.map((item) => [String(item.protocol || "").toLowerCase(), item]));
          }
        } catch {
          // Pulse enriches risk labels but is not required for market discovery.
        }

        for (const market of markets) {
          const protocol = String(market.protocol || "Unknown protocol");
          const symbol = String(market.symbol || "Yield pool");
          const chainId = Number(market.chain_id ?? 0);
          if (!isMvpChainId(chainId)) continue;
          const apy = Number(market.apy ?? 0);
          const pulse = pulseMap[protocol.toLowerCase()];
          const tvl = Number(market.tvl ?? pulse?.tvl ?? 0);
          const riskScore = Number(market.risk_score ?? riskScoreFor(protocol));
          const pulseScore = Number(pulse?.pulse_score ?? 60);
          const isRisk = pulseScore < 40 || riskScore >= 6 || market.impermanent_loss === true;
          built.push({
            id: `dl-${protocol}-${chainId}-${market.pool_id || symbol}`,
            asset: symbol,
            protocol,
            primary: `${apy.toFixed(2)}% APY`,
            secondary: market.chain || chainNameFromId(chainId) || "Particle EVM",
            icon: iconFor(symbol),
            color: "bg-[#2A2A3E]",
            positive: apy > 0,
            category: isRisk ? "Risk" : "Yield",
            tvl: tvl > 0 ? formatUsdValue(tvl) : "—",
            utilization: isRisk ? `${pulseScore.toFixed(0)} pulse` : market.trend || "—",
            risk: riskFromScore(riskScore),
            description: `Live ${symbol} yield market on ${market.chain || chainNameFromId(chainId) || "Particle EVM"}. Data sourced from the mom3 market catalog.`,
            apy,
            tvlValue: tvl,
            chainId,
            chain: market.chain || chainNameFromId(chainId) || "Particle EVM",
            marketId: market.market_id || market.pool_id,
            executionEnabled: market.execution?.enabled === true,
            apyChange1d: Number(market.apy_change_1d ?? 0),
            apyChange7d: Number(market.apy_change_7d ?? 0),
            apyChange30d: Number(market.apy_change_30d ?? 0),
          });
        }

        // Sort: yield pools by APY desc, risk pools after.
        built.sort((a, b) => {
          if (a.category !== b.category) return a.category === "Yield" ? -1 : 1;
          return b.apy - a.apy;
        });

        if (!cancelled) {
          setPools(built);
          hasLoadedRef.current = true;
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load yield markets.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [marketRevision, marketSnapshot]);

  const yieldPools = pools.filter((p) => p.category === "Yield");
  const riskPools = pools.filter((p) => p.category === "Risk");
  const chains = Array.from(new Set(pools.map((p) => p.chainId))).filter(Boolean);

  return { pools, yieldPools, riskPools, chains, isLoading, error };
}
