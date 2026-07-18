"use client";

import * as React from "react";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { MiniChart, TimeRangeControl, type TimeRange } from "@/components/ui/mini-chart";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { Typography } from "@/components/ui/typography";
import { formatUsdValue } from "@/lib/format";
import type { MarketDetail } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";
import { DEFAULT_AAVE_CHAIN_ID, getAaveMarketConfig } from "@/modules/explore/constants/aave.constants";
import { useAaveMarket } from "@/modules/explore/hooks/useAaveMarket";
import { useYieldMarketDetail } from "@/modules/explore/hooks/useYieldMarketDetail";
import { MarketDetailSkeleton } from "@/modules/market-detail/components/MarketDetailSkeleton";
import { normalizePrimaryAssetTokens } from "@/modules/send/utils/send.utils";
import { YieldPositionAction } from "@/modules/yield-execution/components/YieldPositionAction";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";

export default function MarketDetailView({
  market,
  executionMarketId,
}: {
  market: MarketDetail;
  executionMarketId?: string;
}) {
  const [range, setRange] = React.useState<TimeRange>("1W");
  const [chartMetric, setChartMetric] = React.useState<"apy" | "tvl">("apy");
  const { primaryAssets, accountInfo } = useUniversalAccount();
  const chainId = market.chainId || DEFAULT_AAVE_CHAIN_ID;
  const catalogDetail = useYieldMarketDetail(market, executionMarketId);
  const isAaveUsdcMarket = market.protocol.toLowerCase().includes("aave")
    && market.asset.toUpperCase() === "USDC"
    && market.category === "Yield";
  const isOnchainAaveMarket = isAaveUsdcMarket && Boolean(getAaveMarketConfig(chainId));
  const aaveMarket = useAaveMarket(
    isOnchainAaveMarket ? accountInfo.evmSmartAccount || undefined : undefined,
    chainId,
    isOnchainAaveMarket,
  );
  const tokenRows = React.useMemo(
    () => normalizePrimaryAssetTokens(primaryAssets, true),
    [primaryAssets],
  );

  const liveMarket = isOnchainAaveMarket && aaveMarket.data
    ? {
        ...catalogDetail.market,
        primary: `${aaveMarket.data.apy.toFixed(2)}% APY`,
        tvl: formatUsdValue(aaveMarket.data.tvl),
        utilization: `${aaveMarket.data.utilization.toFixed(0)}%`,
        chartData: catalogDetail.market.chartData["1W"].length > 1
          ? catalogDetail.market.chartData
          : aaveMarket.data.chart,
      }
    : catalogDetail.market;
  const hasCatalogData = Boolean(catalogDetail.metadata.lastUpdated);
  const hasAaveData = isOnchainAaveMarket && Boolean(aaveMarket.data);
  const hasLiveData = hasCatalogData || hasAaveData;
  const isDetailLoading = !hasLiveData
    && (catalogDetail.isLoading || (isOnchainAaveMarket && aaveMarket.isLoading));
  const detailError = !hasLiveData && !isDetailLoading
    ? (isOnchainAaveMarket ? aaveMarket.error : null) || catalogDetail.error || "Live market data is unavailable."
    : null;
  const hasApyChart = liveMarket.chartData[range].length > 1;
  const hasTvlChart = catalogDetail.metadata.tvlChart[range].length > 1;
  const heroTvl = isOnchainAaveMarket && aaveMarket.data && aaveMarket.data.tvl > 0
    ? formatUsdValue(aaveMarket.data.tvl)
    : catalogDetail.metadata.currentTvl !== null
      ? formatUsdValue(catalogDetail.metadata.currentTvl)
      : liveMarket.tvl || "Unavailable";
  const executionAssetSymbol = catalogDetail.metadata.executionAssetSymbol || "USDC";
  const universalAssetBalance = tokenRows
    .filter((token) => token.symbol.toUpperCase() === executionAssetSymbol.toUpperCase())
    .reduce((total, token) => total + token.balance, 0);
  // Keep the action panel visible for every canonical market detail. The
  // Backend remains the execution adapter gate; a delayed adapter response
  // must not make the Supply/Withdraw controls disappear from the UI.
  const canExecuteYield = Boolean(executionMarketId && catalogDetail.metadata.executionEnabled);
  const tone = liveMarket.risk === "High" ? "red" : liveMarket.risk === "Medium" ? "yellow" : "green";

  async function refreshAll() {
    await Promise.all([
      catalogDetail.refresh(),
      isOnchainAaveMarket ? aaveMarket.refresh() : Promise.resolve(null),
    ]);
  }

  return (
    <MobileShell>
      <MobilePageHeader title="Market" backHref="/explore" backLabel="Back to explore" />

      {isDetailLoading ? <MarketDetailSkeleton /> : detailError ? (
        <section className="mt-4 rounded-[24px] border border-red-400/20 bg-red-500/10 p-4" role="alert">
          <h2 className="text-base font-black text-red-50">Market data unavailable</h2>
          <p className="mt-1.5 text-sm font-medium text-red-100/80">{detailError}</p>
          <Button type="button" color="danger" size="compact" rounded="full" className="mt-3" label="Retry live data" onClick={() => void refreshAll()} />
        </section>
      ) : (
        <>
          {catalogDetail.error && !isOnchainAaveMarket ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-red-500/10 px-3 py-2.5" role="alert">
              <p className="text-xs font-semibold text-red-100">{catalogDetail.error}</p>
              <Button type="button" color="danger" size="compact" rounded="full" label="Retry" onClick={() => void catalogDetail.refresh()} />
            </div>
          ) : null}

          <section className="mt-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_82%_4%,rgba(204,255,0,0.16),rgba(17,18,23,1)_42%)] p-3.5">
            <div className="flex items-start gap-3">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${market.color}`}>
                <AppIcon icon={market.icon} aria-hidden="true" width={28} height={28} className={market.color === "bg-[#ccff00]" ? "text-black" : "text-white"} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-black text-white">{liveMarket.asset} on {liveMarket.protocol}</h1>
                  <span className="rounded-full bg-[#3B33BD]/20 px-2.5 py-1 text-[10px] font-black text-[#ccff00]">{liveMarket.category}</span>
                </div>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#A7A7B7]">{liveMarket.description}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div><p className="text-xs font-medium text-[#A7A7B7]">Current rate</p><p className="mt-1 text-3xl font-black text-white">{liveMarket.primary}</p></div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#A7A7B7]">TVL</p>
                <p className="mt-1 text-2xl font-black text-[#ccff00]">{heroTvl}</p>
                {catalogDetail.metadata.change7d !== null ? <p className="mt-1 text-xs font-bold text-[#A7A7B7]">APY {catalogDetail.metadata.change7d >= 0 ? "+" : ""}{catalogDetail.metadata.change7d.toFixed(2)}% in 7d</p> : null}
              </div>
            </div>
          </section>

          {/* Legacy analysis block moved into the compact Risk overview and View analysis sections.
                {[["Base APY", catalogDetail.metadata.apyBase !== null ? `${catalogDetail.metadata.apyBase.toFixed(2)}%` : "Unavailable"], ["Reward APY", catalogDetail.metadata.apyReward !== null ? `${catalogDetail.metadata.apyReward.toFixed(2)}%` : "Unavailable"], ["Outlook", catalogDetail.metadata.analysis.market_outlook.label], ["Confidence", `${catalogDetail.metadata.analysis.confidence.percent}% · ${catalogDetail.metadata.analysis.confidence.label}`]].map(([label, value]) => <div key={label} className="rounded-xl bg-white/[0.04] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8E8E93]">{label}</p><p className="mt-1 text-sm font-black text-white">{value}</p></div>)}
              </div>
              <div className="mt-4 space-y-3">{catalogDetail.metadata.analysis.sections.map((section) => <div key={section.title}><h3 className="text-xs font-black text-[#ccff00]">{section.title}</h3><ul className="mt-1 space-y-1">{section.points.map((point) => <li key={point} className="text-xs leading-relaxed text-[#A7A7B7]">• {point}</li>)}</ul></div>)}</div>
            </> : <p className="mt-3 text-sm text-[#A7A7B7]">Analysis is temporarily unavailable. Live APY and risk data are still shown below.</p>}
          </section> */}

          {canExecuteYield && executionMarketId ? (
            <YieldPositionAction
              chainId={chainId}
              marketId={executionMarketId}
              protocol={liveMarket.protocol}
              network={liveMarket.secondary}
              assetSymbol={executionAssetSymbol}
              universalAssetBalance={universalAssetBalance}
              onRefresh={refreshAll}
            />
          ) : null}

          {hasApyChart || hasTvlChart ? (
            <section className="mt-4 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-labelledby="performance-title">
              <div className="flex items-center justify-between gap-3">
                <h2 id="performance-title" className="text-sm font-black text-white">Performance</h2>
                {hasApyChart && hasTvlChart ? (
                  <div className="flex rounded-full bg-white/[0.06] p-1" role="tablist" aria-label="Performance metric">
                    {(["apy", "tvl"] as const).map((metric) => (
                      <button key={metric} type="button" role="tab" aria-selected={chartMetric === metric} className={cn("min-h-10 rounded-full px-4 text-xs font-black uppercase focus-visible:ring-2 focus-visible:ring-[#ccff00]", chartMetric === metric ? "bg-[#ccff00] text-black" : "text-[#C8C8CE]")} onClick={() => setChartMetric(metric)}>{metric}</button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-3"><TimeRangeControl value={range} onChange={setRange} /></div>
              {hasApyChart && (chartMetric === "apy" || !hasTvlChart) ? <MiniChart values={liveMarket.chartData[range]} label="Supply APY" tone={tone} range={range} defaultView="line" className="mt-3 border-0 bg-transparent p-0" /> : null}
              {hasTvlChart && (chartMetric === "tvl" || !hasApyChart) ? <MiniChart values={catalogDetail.metadata.tvlChart[range]} label="Total value locked" tone="purple" range={range} defaultView="line" valueFormat="usd" compact className="mt-3 border-0 bg-transparent p-0" /> : null}
            </section>
          ) : null}

          <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-labelledby="risk-overview-title">
            <h2 id="risk-overview-title" className="text-sm font-black text-white">Risk overview</h2>
            <dl className="mt-3 grid grid-cols-3 overflow-hidden rounded-[18px] bg-white/[0.04] text-xs">
              {[["Risk", liveMarket.risk], ["Utilization", liveMarket.utilization], ["Outlook", catalogDetail.metadata.analysis?.market_outlook.label || catalogDetail.metadata.predictionClass || liveMarket.secondary]].map(([label, value], index) => (
                <div key={label} className={cn("p-3", index < 2 && "border-r border-white/10")}><dt className="font-medium text-[#A7A7B7]">{label}</dt><dd className="mt-1.5 font-mono font-black text-white">{value}</dd></div>
              ))}
            </dl>
            <div className="mt-3 rounded-[18px] border border-white/10 bg-[#111217] p-3" aria-labelledby="compact-analysis-title">
              <div className="flex items-center justify-between gap-3">
                <div><h3 id="compact-analysis-title" className="text-xs font-black text-white">AgentKit market analyst</h3><p className="mt-1 text-[11px] text-[#A7A7B7]">Compact signal from the canonical catalog.</p></div>
                {catalogDetail.metadata.analysis ? <span className="rounded-full bg-[#ccff00]/10 px-2 py-1 text-[10px] font-black uppercase text-[#ccff00]">{catalogDetail.metadata.analysis.recommendation}</span> : null}
              </div>
              {catalogDetail.metadata.analysis ? <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs"><div className="flex justify-between gap-2"><span className="text-[#8E8E93]">Base APY</span><strong className="text-white">{catalogDetail.metadata.apyBase?.toFixed(2) ?? "—"}%</strong></div><div className="flex justify-between gap-2"><span className="text-[#8E8E93]">Reward APY</span><strong className="text-white">{catalogDetail.metadata.apyReward?.toFixed(2) ?? "—"}%</strong></div><div className="flex justify-between gap-2"><span className="text-[#8E8E93]">Outlook</span><strong className="text-white">{catalogDetail.metadata.analysis.market_outlook.label}</strong></div><div className="flex justify-between gap-2"><span className="text-[#8E8E93]">Confidence</span><strong className="text-white">{catalogDetail.metadata.analysis.confidence.percent}%</strong></div></div> : <p className="mt-3 text-xs text-[#A7A7B7]">Analysis is temporarily unavailable.</p>}
            </div>
          </section>

          <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-labelledby="detail-analysis-title">
            <div className="flex items-center justify-between gap-3"><div><h2 id="detail-analysis-title" className="text-sm font-black text-white">View analysis</h2><p className="mt-1 text-xs text-[#A7A7B7]">Detailed review of yield, liquidity, risk, and execution.</p></div><AppIcon icon="solar:chart-2-bold" aria-hidden="true" width={20} height={20} className="text-[#ccff00]" /></div>
            {catalogDetail.metadata.analysis ? <details className="group mt-3 overflow-hidden rounded-[18px] border border-white/10 bg-[#15161D]">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 text-xs font-black text-[#C8C8CE] focus-visible:ring-2 focus-visible:ring-[#ccff00]"><span>Open senior analyst report</span><AppIcon icon="lucide:chevron-down" aria-hidden="true" width={18} height={18} className="transition-transform group-open:rotate-180" /></summary>
              <div className="border-t border-white/10 p-3">
                <p className="text-sm font-semibold leading-relaxed text-[#E8E8EC]">{catalogDetail.metadata.analysis.summary}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#A7A7B7]">{catalogDetail.metadata.analysis.confidence.explanation}</p>
                <div className="mt-4 space-y-4">{catalogDetail.metadata.analysis.sections.map((section) => <div key={section.title}><h3 className="text-xs font-black text-[#ccff00]">{section.title}</h3><ul className="mt-2 space-y-1.5">{section.points.map((point) => <li key={point} className="text-xs leading-relaxed text-[#A7A7B7]">- {point}</li>)}</ul></div>)}</div>
                <div className="mt-4 rounded-xl bg-white/[0.04] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8E8E93]">7-day outlook</p><p className="mt-1 text-xs leading-relaxed text-white">{catalogDetail.metadata.analysis.market_outlook.reasoning}</p></div>
              </div>
            </details> : <p className="mt-3 rounded-xl border border-white/10 bg-[#15161D] p-3 text-xs text-[#A7A7B7]">Detailed analysis is temporarily unavailable. Try refreshing the market data.</p>}
          </section>
        </>
      )}
    </MobileShell>
  );
}
