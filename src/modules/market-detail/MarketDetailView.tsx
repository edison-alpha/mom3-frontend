"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

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
import { universalAccountQueryKeys } from "@/providers/universal-account/constants/universal-account.constants";

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
  const queryClient = useQueryClient();
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
  const annualPercentageYield = Number.parseFloat(liveMarket.primary);
  const executionAssetSymbol = catalogDetail.metadata.executionAssetSymbol || "USDC";
  const universalAssetBalance = tokenRows
    .filter((token) => token.symbol.toUpperCase() === executionAssetSymbol.toUpperCase())
    .reduce((total, token) => total + token.balance, 0);
  // Keep the action panel visible for every canonical market detail. The
  // Backend remains the execution adapter gate; a delayed adapter response
  // must not make the Supply/Withdraw controls disappear from the UI.
  const canExecuteYield = Boolean(executionMarketId && catalogDetail.metadata.executionEnabled);
  const tone = liveMarket.risk === "High" ? "red" : liveMarket.risk === "Medium" ? "yellow" : "green";
  const marketAnalysis = catalogDetail.metadata.analysis;
  const apyChange7d = catalogDetail.metadata.change7d;
  const stablecoinTitle = catalogDetail.metadata.stablecoin === true
    ? "Low-risk stablecoin"
    : `${liveMarket.risk}-risk market`;
  const stablecoinDetail = catalogDetail.metadata.stablecoin === true
    ? `${liveMarket.asset} is marked as a stablecoin in the live catalog.`
    : `Live catalog risk is currently marked ${liveMarket.risk.toLowerCase()}.`;
  const rateTitle = apyChange7d === null
    ? "Rate movement unavailable"
    : apyChange7d > 0
      ? "Improving rate"
      : apyChange7d < 0
        ? "Rate decreased"
        : "Stable rate";
  const rateDetail = apyChange7d === null
    ? "The live catalog has not reported a 7-day APY change yet."
    : `APY ${apyChange7d > 0 ? "increased" : apyChange7d < 0 ? "decreased" : "was unchanged"} ${apyChange7d === 0 ? "" : `${Math.abs(apyChange7d).toFixed(2)}% `}over the last 7 days.`;
  const executionTitle = catalogDetail.metadata.executionEnabled ? "You stay in control" : "Execution status";
  const executionDetail = catalogDetail.metadata.executionEnabled
    ? catalogDetail.metadata.requiresConfirmation === false
      ? "A verified execution route is available for review."
      : "Every supply or withdrawal action still needs your approval."
    : "This is a discovery market until an execution route is available.";

  async function refreshAll() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: universalAccountQueryKeys.snapshot(accountInfo.ownerAddress),
        refetchType: "active",
      }),
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
              <div className="min-w-0 text-right">
                <p className="text-xs font-medium text-[#A7A7B7]">TVL</p>
                <p title={heroTvl} className="mt-1 truncate font-mono text-sm font-black tabular-nums text-[#ccff00]">{heroTvl}</p>
                {catalogDetail.metadata.change7d !== null ? <p className="mt-1 whitespace-nowrap text-[10px] font-bold text-[#A7A7B7]">APY {catalogDetail.metadata.change7d >= 0 ? "+" : ""}{catalogDetail.metadata.change7d.toFixed(2)}% in 7d</p> : null}
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
              annualPercentageYield={Number.isFinite(annualPercentageYield) ? annualPercentageYield : null}
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

          <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-labelledby="why-recommended-title">
            <h2 id="why-recommended-title" className="text-sm font-black text-white">
              {marketAnalysis?.recommendation === "consider" ? "Why MOM3 recommends this" : "Live market signals"}
            </h2>
            <div className="mt-3 grid grid-cols-2 divide-x divide-white/[0.08]">
              <div className="space-y-4 pr-3">
                <div className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ccff00]/10 text-[#ccff00]"><AppIcon icon="solar:shield-check-bold" aria-hidden="true" width={17} height={17} /></span>
                  <div><h3 className="text-xs font-black text-white">{stablecoinTitle}</h3><p className="mt-0.5 text-[11px] font-medium leading-snug text-[#A7A7B7]">{stablecoinDetail}</p></div>
                </div>
                <div className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A98BFF]/10 text-[#C5B4FF]"><AppIcon icon="solar:chart-2-bold" aria-hidden="true" width={17} height={17} /></span>
                  <div><h3 className="text-xs font-black text-white">Strong liquidity</h3><p className="mt-0.5 text-[11px] font-medium leading-snug text-[#A7A7B7]">{heroTvl === "Unavailable" ? "Current TVL is unavailable." : `${heroTvl} is currently locked in this market.`}</p></div>
                </div>
              </div>
              <div className="space-y-4 pl-3">
                <div className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ccff00]/10 text-[#ccff00]"><AppIcon icon="solar:graph-up-bold" aria-hidden="true" width={17} height={17} /></span>
                  <div><h3 className="text-xs font-black text-white">{rateTitle}</h3><p className="mt-0.5 text-[11px] font-medium leading-snug text-[#A7A7B7]">{rateDetail}</p></div>
                </div>
                <div className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A98BFF]/10 text-[#C5B4FF]"><AppIcon icon="solar:lock-keyhole-bold" aria-hidden="true" width={17} height={17} /></span>
                  <div><h3 className="text-xs font-black text-white">{executionTitle}</h3><p className="mt-0.5 text-[11px] font-medium leading-snug text-[#A7A7B7]">{executionDetail}</p></div>
                </div>
              </div>
            </div>
          </section>

          {marketAnalysis ? (
            <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-labelledby="market-recommendation-title">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2"><AppIcon icon="solar:stars-bold" aria-hidden="true" width={20} height={20} className="shrink-0 text-[#A98BFF]" /><h2 id="market-recommendation-title" className="truncate text-sm font-black text-white">MOM3 recommendation</h2></div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black", marketAnalysis.recommendation === "consider" ? "bg-[#ccff00]/10 text-[#ccff00]" : "bg-[#FFC857]/10 text-[#FFC857]")}>{marketAnalysis.recommendation === "consider" ? "Good option" : "Watchlist"}</span>
              </div>
              <p className="mt-3 text-xs font-medium leading-relaxed text-[#D9D9DF]">{marketAnalysis.summary}</p>
              <dl className="mt-4 grid grid-cols-2 divide-x divide-y divide-white/[0.08] overflow-hidden rounded-[16px] border border-white/[0.08] text-center min-[390px]:grid-cols-4 min-[390px]:divide-y-0">
                <div className="min-w-0 p-2.5"><dt className="text-[10px] font-medium text-[#A7A7B7]">Base yield</dt><dd className="mt-1 truncate font-mono text-sm font-black tabular-nums text-[#ccff00]">{catalogDetail.metadata.apyBase?.toFixed(2) ?? "—"}%</dd></div>
                <div className="min-w-0 p-2.5"><dt className="text-[10px] font-medium text-[#A7A7B7]">Rewards</dt><dd className="mt-1 truncate font-mono text-sm font-black tabular-nums text-[#A98BFF]">{catalogDetail.metadata.apyReward?.toFixed(2) ?? "—"}%</dd></div>
                <div className="min-w-0 p-2.5"><dt className="text-[10px] font-medium text-[#A7A7B7]">Confidence</dt><dd className="mt-1 truncate font-mono text-sm font-black tabular-nums text-[#ccff00]">{marketAnalysis.confidence.percent}%</dd></div>
                <div className="min-w-0 p-2.5"><dt className="text-[10px] font-medium text-[#A7A7B7]">Outlook</dt><dd title={marketAnalysis.market_outlook.label} className="mt-1 truncate text-sm font-black text-[#63B6FF]">{marketAnalysis.market_outlook.label}</dd></div>
              </dl>
            </section>
          ) : null}

          <section className="hidden mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-labelledby="risk-overview-title">
            <h2 id="risk-overview-title" className="text-sm font-black text-white">Risk overview</h2>
            <dl className="mt-3 grid grid-cols-3 overflow-hidden rounded-[18px] bg-white/[0.04] text-xs">
              {[["Risk", liveMarket.risk], ["Utilization", liveMarket.utilization], ["Outlook", catalogDetail.metadata.predictionClass || liveMarket.secondary]].map(([label, value], index) => (
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

          <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-labelledby="agent-analysis-title">
            <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><AppIcon icon="solar:stars-bold" aria-hidden="true" width={18} height={18} className="text-[#ccff00]" /><h2 id="agent-analysis-title" className="text-sm font-black text-white">mom3 Agent analysis</h2></div><p className="mt-1 text-xs text-[#A7A7B7]">Live yield, liquidity, risk, and execution context from mom3 Agent.</p></div>{marketAnalysis ? <span className="shrink-0 rounded-full bg-[#ccff00]/10 px-2.5 py-1 text-[10px] font-black tabular-nums text-[#ccff00]">{marketAnalysis.confidence.percent}% confidence</span> : <AppIcon icon="solar:chart-2-bold" aria-hidden="true" width={20} height={20} className="text-[#ccff00]" />}</div>
            {marketAnalysis ? <details className="group mt-3 overflow-hidden rounded-[18px] border border-white/10 bg-[#15161D]">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 text-xs font-black text-[#C8C8CE] focus-visible:ring-2 focus-visible:ring-[#ccff00]"><span>Open mom3 Agent analysis</span><AppIcon icon="lucide:chevron-down" aria-hidden="true" width={18} height={18} className="transition-transform group-open:rotate-180" /></summary>
              <div className="border-t border-white/10 p-3">
                <p className="text-sm font-semibold leading-relaxed text-[#E8E8EC]">{marketAnalysis.summary}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#A7A7B7]">{marketAnalysis.confidence.explanation}</p>
                <div className="mt-4 space-y-4">{marketAnalysis.sections.map((section) => <div key={section.title}><h3 className="text-xs font-black text-[#ccff00]">{section.title}</h3><ul className="mt-2 space-y-1.5">{section.points.map((point) => <li key={point} className="text-xs leading-relaxed text-[#A7A7B7]">- {point}</li>)}</ul></div>)}</div>
                <div className="mt-4 rounded-xl bg-white/[0.04] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8E8E93]">7-day outlook</p><p className="mt-1 text-xs leading-relaxed text-white">{marketAnalysis.market_outlook.reasoning}</p></div>
              </div>
            </details> : <p className="mt-3 rounded-xl border border-white/10 bg-[#15161D] p-3 text-xs text-[#A7A7B7]">Detailed analysis is temporarily unavailable. Try refreshing the market data.</p>}
          </section>
        </>
      )}
    </MobileShell>
  );
}
