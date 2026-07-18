"use client";

import Link from "next/link";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { MiniChart } from "@/components/ui/mini-chart";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { Typography } from "@/components/ui/typography";
import { useMarketAnalysisInfinite } from "./hooks/useMarketAnalysisInfinite";
import type { MarketAnalysisItem } from "./types/market-analysis.types";
import { fallbackOpportunities } from "./components/StrategyResponse";
import type { AiStrategy, StrategyOpportunity } from "./types/ai.types";
import { StrategyModeCard } from "@/modules/dashboard/components/StrategyModeCard";
import { portfolioModes } from "@/modules/dashboard/constants/dashboard";

export type StrategySelection = {
  marketId?: string;
  protocol?: string;
  chainId?: number;
  pool?: string;
  poolId?: string;
};

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

function MarketAnalysisResults({ riskTolerance }: { riskTolerance: "conservative" | "moderate" | "aggressive" }) {
  const analysisQuery = useMarketAnalysisInfinite({ pageSize: 10, riskTolerance });
  const items = analysisQuery.data?.pages.flatMap((page) => page.markets) ?? [];
  return (
    <section className="mt-5" aria-labelledby="all-market-analysis-title">
      <div className="flex items-end justify-between gap-3"><div><h2 id="all-market-analysis-title" className="text-lg font-black text-white">All market analysis</h2><p className="mt-1 text-xs font-medium text-[#A7A7B7]">AgentKit ranks the full PostgreSQL catalog; the first page shows 10 results.</p></div>{analysisQuery.data?.pages[0]?.analysis.market_count ? <span className="text-xs font-black text-[#ccff00]">{analysisQuery.data.pages[0].analysis.market_count.toLocaleString()} reviewed</span> : null}</div>
      {analysisQuery.isLoading ? <div className="mt-3 rounded-2xl bg-[#111217] p-4 text-sm text-[#A7A7B7]" aria-busy="true">Reading and analysing canonical markets…</div> : analysisQuery.isError ? <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4" role="alert"><p className="text-sm text-red-100">{analysisQuery.error instanceof Error ? analysisQuery.error.message : "Market analysis is unavailable."}</p><Button type="button" color="danger" size="compact" rounded="full" className="mt-3" label="Retry analysis" onClick={() => void analysisQuery.refetch()} /></div> : items.length === 0 ? <div className="mt-3 rounded-2xl bg-[#111217] p-4 text-sm text-[#A7A7B7]">No market matched this risk profile.</div> : <>
        <div className="mt-3 space-y-3">{items.map((item) => <AnalysisResultCard key={`${item.market_id}-${item.rank}`} item={item} />)}</div>
        {analysisQuery.hasNextPage ? <Button type="button" color="dark" size="lg" rounded="full" fullWidth className="mt-4" label={analysisQuery.isFetchingNextPage ? "Loading more analysis…" : "Load more analysis"} isDisabled={analysisQuery.isFetchingNextPage} onClick={() => void analysisQuery.fetchNextPage()} /> : <p className="mt-4 text-center text-xs font-medium text-[#777780]">All matching markets are loaded.</p>}
      </>}
    </section>
  );
}

function AnalysisResultCard({ item }: { item: MarketAnalysisItem }) {
  const recommendationTone = item.analysis.recommendation === "consider"
    ? "bg-[#5EE6B0]/10 text-[#5EE6B0]"
    : item.analysis.recommendation === "avoid"
      ? "bg-red-400/10 text-red-200"
      : "bg-[#FFD166]/10 text-[#FFD166]";
  return <article className="rounded-[22px] border border-white/10 bg-[#111217] p-4">
    <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ccff00] text-sm font-black text-black">#{item.rank}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-black text-white">{item.protocol} · {item.symbol || item.asset}</h3><p className="mt-1 text-xs text-[#A7A7B7]">{item.chain} · {item.analysis.market_outlook.label} outlook · {item.analysis.confidence.percent}% confidence</p></div><span className="text-right text-lg font-black text-[#5EE6B0]">{item.apy.toFixed(2)}%</span></div>
    <p className="mt-3 text-xs leading-relaxed text-[#C8C8CE]">{item.analysis.summary}</p>
    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-[#A7A7B7]"><span className="rounded-full bg-white/[0.06] px-2.5 py-1">TVL ${item.tvl >= 1_000_000 ? `${(item.tvl / 1_000_000).toFixed(1)}M` : item.tvl.toLocaleString()}</span><span className="rounded-full bg-white/[0.06] px-2.5 py-1">Risk {item.risk_score.toFixed(1)}/10</span><span className={`rounded-full px-2.5 py-1 uppercase ${recommendationTone}`}>{item.analysis.recommendation}</span></div>
    <Link href={`/explore/${encodeURIComponent(`${item.protocol}-${item.asset}`)}?chainId=${item.chain_id}&marketId=${encodeURIComponent(item.market_id)}`} className="mt-3 inline-flex min-h-10 items-center text-xs font-black text-[#ccff00] focus-visible:ring-2 focus-visible:ring-[#ccff00]">View market <AppIcon icon="lucide:arrow-right" aria-hidden="true" width={15} height={15} className="ml-1" /></Link>
  </article>;
}

function StrategyDetail({ opportunity, reasoning }: { opportunity: StrategyOpportunity; reasoning: string }) {
  const risk = riskLabel(opportunity.risk_score);
  const tone = risk === "High" ? "red" : risk === "Medium" ? "yellow" : "green";
  const forecast = opportunity.forecast?.forecast_7d ?? [];
  const pulse = opportunity.liquidity_pulse;

  return (
    <>
      <section className="mt-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_82%_4%,rgba(204,255,0,0.14),rgba(17,18,23,1)_42%)] p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3B33BD]/30 text-[#ccff00]">
            <AppIcon icon="solar:graph-up-bold" aria-hidden="true" width={27} height={27} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black text-white">Supply {cleanProtocol(opportunity.protocol)}</h1>
            <p className="mt-1 text-xs font-medium text-[#A7A7B7]">{opportunity.pool} · {opportunity.chain}</p>
          </div>
          <span className="rounded-full bg-[#ccff00]/10 px-2.5 py-1 text-[10px] font-black text-[#ccff00]">
            {opportunity.allocation.toFixed(1)}% allocation
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-[#A7A7B7]">Expected APY</p>
            <p className="mt-1 text-3xl font-black text-[#5EE6B0]">+{opportunity.apy.toFixed(2)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-[#A7A7B7]">Risk level</p>
            <p className="mt-1 text-2xl font-black text-[#FFD166]">{risk}</p>
          </div>
        </div>
      </section>

      {forecast.length > 1 ? (
        <section className="mt-4 rounded-[22px] border border-white/10 bg-[#111217] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-white">7-day APY forecast</h2>
              <p className="mt-1 text-xs font-medium text-[#A7A7B7]">
                {opportunity.forecast?.trend || "stable"} · {Math.round((opportunity.forecast?.confidence || 0) * 100)}% confidence
              </p>
            </div>
            <AppIcon icon="solar:chart-2-bold" aria-hidden="true" width={20} height={20} className="text-[#ccff00]" />
          </div>
          <MiniChart values={forecast} label={`${opportunity.protocol} APY forecast`} tone={tone} range="1W" className="mt-3" />
        </section>
      ) : null}

      <section className="mt-3 grid grid-cols-3 overflow-hidden rounded-[20px] border border-white/10 bg-[#111217]">
        {[
          ["TVL", formatUsd(opportunity.tvl)],
          ["Base APY", typeof opportunity.apy_base === "number" ? `${opportunity.apy_base.toFixed(2)}%` : "—"],
          ["Reward APY", typeof opportunity.apy_reward === "number" ? `${opportunity.apy_reward.toFixed(2)}%` : "—"],
        ].map(([label, value], index) => (
          <div key={label} className={`p-3 ${index < 2 ? "border-r border-white/10" : ""}`}>
            <p className="text-xs font-medium text-[#A7A7B7]">{label}</p>
            <p className="mt-1.5 text-xs font-black text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-white">Market signals</h2>
          <span className="inline-flex items-center gap-1 text-xs font-black text-[#ccff00]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]" /> Live
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {[
            ["Liquidity pulse", pulse?.status || "Not measured"],
            ["24h APY change", typeof opportunity.apy_change_1d === "number" ? `${opportunity.apy_change_1d >= 0 ? "+" : ""}${opportunity.apy_change_1d.toFixed(2)}%` : "Unavailable"],
            ["Risk score", `${opportunity.risk_score.toFixed(1)}/10`],
            ["Utilization", typeof opportunity.utilization === "number" ? `${opportunity.utilization.toFixed(1)}%` : "Not applicable"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[#A7A7B7]">{label}</span>
              <span className="text-right font-black text-white">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-4">
        <h2 className="text-sm font-black text-white">Why this strategy?</h2>
        <p className="mt-2 text-xs font-medium leading-relaxed text-[#A7A7B7]">{reasoning}</p>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.08em] text-[#777780]">Source: {opportunity.source}</p>
      </section>

      {opportunity.market_id ? (
        <Link
          href={`/explore/${encodeURIComponent(`${opportunity.protocol}-${opportunity.asset}`)}?chainId=${opportunity.chain_id}&marketId=${encodeURIComponent(opportunity.market_id)}`}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ccff00] px-5 text-sm font-black text-black focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Supply with Particle
          <AppIcon icon="lucide:arrow-right" aria-hidden="true" width={17} height={17} />
        </Link>
      ) : null}

      <Link href="/ai" className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-[#111217] px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
        Explore other strategies
        <AppIcon icon="lucide:arrow-right" aria-hidden="true" width={17} height={17} />
      </Link>
    </>
  );
}

export default function AiStrategyView({ selection }: { selection?: StrategySelection }) {
  const [riskTolerance, setRiskTolerance] = React.useState<"conservative" | "moderate" | "aggressive">("moderate");
  const strategyQuery = useQuery<AiStrategy, Error>({
    queryKey: ["ai", "strategy", riskTolerance],
    queryFn: async () => {
      const response = await fetch("/api/ai/strategy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ risk_tolerance: riskTolerance }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.error || "Strategy unavailable.");
      return payload as AiStrategy;
    },
    staleTime: 60_000,
  });

  React.useEffect(() => {
    const savedMode = window.localStorage.getItem("mom3-risk-tolerance");
    if (savedMode === "conservative" || savedMode === "moderate" || savedMode === "aggressive") {
      setRiskTolerance(savedMode);
    }
  }, []);

  const strategy = strategyQuery.data ?? null;
  const isLoading = strategyQuery.isPending;
  const error = strategyQuery.error?.message ?? null;
  const load = React.useCallback(() => strategyQuery.refetch(), [strategyQuery]);

  const selectedOpportunity = React.useMemo(() => {
    if (!strategy) return null;
    const opportunities = Array.from(
      new Map(
        [...(strategy.opportunities ?? []), ...fallbackOpportunities(strategy)]
          .map((item) => [item.market_id || `${item.protocol}:${item.chain_id}:${item.pool}`, item] as const),
      ).values(),
    );
    if (selection?.marketId) {
      const byMarketId = opportunities.find((item) => item.market_id === selection.marketId);
      if (byMarketId) return byMarketId;
    }
    if (!selection?.protocol) return null;
    const protocol = selection.protocol.toLowerCase();
    return opportunities.find((item) =>
      item.protocol.toLowerCase() === protocol &&
      (!selection.chainId || item.chain_id === selection.chainId) &&
      (!selection.poolId || item.pool_id === selection.poolId) &&
      (!selection.pool || item.pool === selection.pool)
    ) ?? opportunities.find((item) =>
      item.protocol.toLowerCase() === protocol &&
      (!selection.chainId || item.chain_id === selection.chainId)
    ) ?? null;
  }, [selection, strategy]);

  const activeModeIndex = riskTolerance === "aggressive" ? 0 : riskTolerance === "conservative" ? 2 : 1;
  const handleSelectMode = (index: number) => {
    const nextRisk = index === 0 ? "aggressive" : index === 2 ? "conservative" : "moderate";
    setRiskTolerance(nextRisk);
    window.localStorage.setItem("mom3-risk-tolerance", nextRisk);
  };

  return (
    <MobileShell>
      <MobilePageHeader title="Strategy detail" backHref="/ai" backLabel="Back to AI strategies" />

      <StrategyModeCard
        compact
        activeMode={portfolioModes[activeModeIndex] ?? portfolioModes[1]}
        activeModeIndex={activeModeIndex}
        onSelectMode={handleSelectMode}
      />

      {isLoading ? (
        <section className="mt-5 animate-pulse rounded-3xl border border-white/10 bg-[#111217] p-5" aria-busy="true">
          <div className="h-14 w-14 rounded-2xl bg-white/10" />
          <div className="mt-5 h-8 w-3/4 rounded bg-white/10" />
          <div className="mt-3 h-4 w-full rounded bg-white/10" />
          <div className="mt-6 h-28 rounded-2xl bg-white/10" />
        </section>
      ) : error ? (
        <section className="mt-5 rounded-3xl border border-red-400/20 bg-red-400/5 p-5" role="alert">
          <Typography as="h2" variant="h3">Strategy unavailable</Typography>
          <Typography variant="body-sm" color="muted" className="mt-2">{error}</Typography>
          <Button type="button" label="Retry" color="primary" rounded="full" className="mt-4" onClick={() => void load()} />
        </section>
      ) : selectedOpportunity && strategy ? (
        <StrategyDetail opportunity={selectedOpportunity} reasoning={strategy.reasoning} />
      ) : strategy ? (
        <section className="mt-5 rounded-3xl border border-white/10 bg-[#111217] p-5 text-center">
          <AppIcon icon="solar:stars-bold" aria-hidden="true" width={36} height={36} className="mx-auto text-[#ccff00]" />
          <h1 className="mt-4 text-xl font-black text-white">Choose a strategy from the AI results</h1>
          <p className="mt-2 text-sm font-medium text-[#A7A7B7]">Open mom3 Agent and select any live opportunity to view its full market details.</p>
          <Link href="/ai" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#ccff00] px-5 text-sm font-black text-black focus-visible:ring-2 focus-visible:ring-[#ccff00]">View AI strategies</Link>
        </section>
      ) : null}
      <MarketAnalysisResults riskTolerance={riskTolerance} />
    </MobileShell>
  );
}
