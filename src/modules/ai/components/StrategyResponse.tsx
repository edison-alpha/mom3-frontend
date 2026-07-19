"use client";

import Link from "next/link";
import * as React from "react";

import { AppIcon } from "@/components/ui/app-icon";
import { chainNameFromId } from "@/lib/chain";
import type { AiStrategy, StrategyOpportunity } from "../types/ai.types";

function formatUsd(value?: number) {
  if (typeof value !== "number" || value <= 0) return "Unavailable";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function riskLabel(score: number) {
  if (score <= 3.5) return "Low";
  if (score <= 6.5) return "Medium";
  return "High";
}

function cleanProtocol(value: string) {
  return value.replace(/\s*\([^)]*\)\s*$/, "");
}

function tokenIcon(symbol: string) {
  const value = symbol.toLowerCase();
  if (value.includes("usdc")) return "cryptocurrency-color:usdc";
  if (value.includes("usdt") || value.includes("tether")) return "cryptocurrency-color:usdt";
  if (value.includes("dai")) return "cryptocurrency-color:dai";
  if (value.includes("eth")) return "cryptocurrency-color:eth";
  if (value.includes("btc")) return "cryptocurrency-color:btc";
  return "solar:coin-bold";
}

function protocolIcon(protocol: string) {
  const value = protocol.toLowerCase();
  if (value.includes("aave")) return "token-branded:aave";
  if (value.includes("compound")) return "simple-icons:compound";
  if (value.includes("morpho")) return "simple-icons:morpho";
  if (value.includes("jupiter")) return "token-branded:jupiter";
  if (value.includes("kamino")) return "token-branded:kamino";
  if (value.includes("raydium")) return "token-branded:raydium";
  if (value.includes("uniswap")) return "simple-icons:uniswap";
  if (value.includes("curve")) return "token-branded:curve";
  if (value.includes("balancer")) return "token-branded:balancer";
  if (value.includes("lido")) return "token-branded:lido";
  if (value.includes("pendle")) return "token-branded:pendle";
  if (value.includes("ethena")) return "token-branded:ethena";
  return "token-branded:defi";
}

function chainIcon(chainId: number) {
  if (chainId === 1 || chainId === 42161 || chainId === 8453 || chainId === 10) {
    return "cryptocurrency-color:eth";
  }
  return "solar:global-bold";
}

function getTokenPair(opportunity: StrategyOpportunity) {
  const raw = opportunity.pool || opportunity.asset || "Yield pool";
  const symbols = raw
    .replace(/\s+supply\s*$/i, "")
    .split(/\s*(?:\/|\-|,)\s*/)
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  return symbols.length > 1 ? symbols.slice(0, 2) : [opportunity.asset || symbols[0] || "Asset"];
}

function MarketIdentity({ opportunity }: { opportunity: StrategyOpportunity }) {
  const tokens = getTokenPair(opportunity);
  const protocol = cleanProtocol(opportunity.protocol);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div role="img" className="flex shrink-0 items-center -space-x-2" aria-label={`${tokens.join("/")} on ${protocol}`}>
        {tokens.map((token) => (
          <span key={token} className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#111217] bg-[#202127]" title={token}>
            <AppIcon icon={tokenIcon(token)} aria-hidden="true" width={24} height={24} />
          </span>
        ))}
        <span className="relative flex h-7 w-7 translate-x-1 items-center justify-center rounded-full border-2 border-[#111217] bg-[#3B33BD]" title={protocol}>
          <AppIcon icon={protocolIcon(protocol)} aria-hidden="true" width={16} height={16} className="text-white" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-black text-white">
          {tokens.join("/")} <span className="px-1 text-[#777780]">→</span> {protocol}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-[#A7A7B7]">
          <AppIcon icon={chainIcon(opportunity.chain_id)} aria-hidden="true" width={14} height={14} />
          {opportunity.chain}
        </p>
      </div>
    </div>
  );
}

export function fallbackOpportunities(strategy: AiStrategy): StrategyOpportunity[] {
  return (strategy.chain_allocations ?? []).map((row) => {
    const pulse = strategy.liquidity_pulse?.find((item) => item.protocol === row.protocol);
    const forecast = strategy.forecast?.find(
      (item) => item.protocol === row.protocol && item.chain_id === row.chain_id,
    );

    return {
      market_id: row.market_id,
      pool_id: row.market_id,
      protocol: row.protocol,
      pool: strategy.asset || "Yield pool",
      asset: strategy.asset || "Multi-asset",
      chain: chainNameFromId(row.chain_id),
      chain_id: row.chain_id,
      allocation: row.allocation,
      apy: row.expected_apy,
      tvl: pulse?.tvl ?? 0,
      risk_score: row.risk_score,
      source: strategy.live_data_source,
      execution: {
        enabled: row.execution_ready !== false,
        actions: ["supply", "withdraw"],
        requires_user_confirmation: true,
      },
      forecast,
      liquidity_pulse: pulse,
    };
  });
}

function OpportunityCard({ opportunity }: { opportunity: StrategyOpportunity }) {
  const pulse = opportunity.liquidity_pulse;
  const risk = riskLabel(opportunity.risk_score);
  const apyChange = opportunity.apy_change_1d;
  const riskClass = risk === "Low" ? "text-[#5EE6B0]" : risk === "Medium" ? "text-[#FFD166]" : "text-[#FF7B7B]";
  return (
    <Link
      href={`/ai/strategy?${new URLSearchParams({
        marketId: opportunity.market_id || "",
        protocol: opportunity.protocol,
        chainId: String(opportunity.chain_id),
        pool: opportunity.pool,
        ...(opportunity.pool_id ? { poolId: opportunity.pool_id } : {}),
      }).toString()}`}
      aria-label={`View ${cleanProtocol(opportunity.protocol)} strategy details`}
      className="block rounded-[24px] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
    <article className="rounded-[24px] border border-white/10 bg-[#111217] p-4 shadow-[0_18px_50px_-34px_rgba(59,51,189,0.95)] motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <MarketIdentity opportunity={opportunity} />
        <div className="hidden">
          <p className="truncate text-base font-black text-white">
            Supply {cleanProtocol(opportunity.protocol)}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-[#A7A7B7]">
            {opportunity.pool} · {opportunity.chain}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2.5 py-1 text-[10px] font-black text-[#ccff00]">
          {opportunity.allocation.toFixed(1)}%
        </span>
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A7A7B7]">
            <AppIcon icon="solar:history-bold" aria-hidden="true" width={15} height={15} />
            Market signals
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ccff00]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]" /> Live
          </span>
        </div>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-[#A7A7B7]">Total value locked</span>
            <span className="font-black text-[#5EE6B0]">{formatUsd(opportunity.tvl)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-[#A7A7B7]">24h APY change</span>
            <span className="font-black text-white">
              {typeof apyChange === "number" ? `${apyChange >= 0 ? "+" : ""}${apyChange.toFixed(2)}%` : "Unavailable"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-[#A7A7B7]">Liquidity pulse</span>
            <span className="font-black text-white">{pulse?.status || "Not measured"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-[#A7A7B7]">Expected APY</p>
          <p className="mt-1 text-3xl font-black text-[#5EE6B0]">+{opportunity.apy.toFixed(2)}%</p>
        </div>
        <div className="border-l border-white/10 pl-3 text-right">
          <p className="text-xs font-medium text-[#A7A7B7]">Risk level</p>
          <p className={`mt-1 text-2xl font-black ${riskClass}`}>{risk}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10">
        {[
          ["Base APY", typeof opportunity.apy_base === "number" ? `${opportunity.apy_base.toFixed(2)}%` : "—"],
          ["Reward APY", typeof opportunity.apy_reward === "number" ? `${opportunity.apy_reward.toFixed(2)}%` : "—"],
          ["Risk score", `${opportunity.risk_score.toFixed(1)}/10`],
        ].map(([label, value], index) => (
          <div key={label} className={`p-2.5 ${index < 2 ? "border-r border-white/10" : ""}`}>
            <p className="text-[10px] font-medium text-[#A7A7B7]">{label}</p>
            <p className="mt-1 text-xs font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {typeof opportunity.utilization === "number" ? (
        <p className="mt-3 text-xs font-medium text-[#A7A7B7]">
          Utilization <span className="font-black text-white">{opportunity.utilization.toFixed(1)}%</span>
        </p>
      ) : null}

      <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#777780]">
        Source: {opportunity.source}
      </p>
      <div className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ccff00] px-4 text-sm font-black text-black">
        View strategy details
        <AppIcon icon="lucide:arrow-right" aria-hidden="true" width={16} height={16} />
      </div>
    </article>
    </Link>
  );
}

export function StrategyResponse({ strategy }: { strategy?: AiStrategy }) {
  // Strategy returns a broader risk-filtered candidate set. Keep the first
  // view compact and let the user progressively reveal more opportunities.
  const pageSize = 3;
  const [visibleCount, setVisibleCount] = React.useState(pageSize);
  React.useEffect(() => setVisibleCount(pageSize), [strategy?.last_updated, strategy?.risk_score]);
  if (!strategy) return null;

  const opportunities = (strategy.opportunities?.length
    ? strategy.opportunities
    : fallbackOpportunities(strategy)
  ).filter((item) => item.allocation > 0);
  const visibleOpportunities = opportunities.slice(0, visibleCount);

  return (
    <div>
      <div className="mb-3 flex items-start gap-2.5 px-1">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3B33BD]/25 text-[#ccff00]">
          <AppIcon icon="solar:stars-bold" aria-hidden="true" width={16} height={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black text-white">AI strategy summary</p>
            <span className="shrink-0 text-[10px] font-medium text-[#777780]">
              {new Date(strategy.last_updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium leading-relaxed text-[#A7A7B7]">
            {strategy.reasoning}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {opportunities.length > 0 ? (
          visibleOpportunities.map((opportunity) => (
            <OpportunityCard
              key={`${opportunity.protocol}-${opportunity.chain_id}-${opportunity.pool_id || opportunity.pool}`}
              opportunity={opportunity}
            />
          ))
        ) : (
          <div className="rounded-[22px] border border-white/10 bg-[#111217] p-4 text-sm font-medium text-[#A7A7B7]">
            No live yield opportunity passed the current risk filter.
          </div>
        )}
        {visibleCount < opportunities.length ? (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => Math.min(opportunities.length, current + pageSize))}
              className="min-h-10 rounded-full px-4 text-xs font-bold text-[#ccff00] transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#ccff00]"
            >
              Show more ({opportunities.length - visibleCount} remaining)
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
