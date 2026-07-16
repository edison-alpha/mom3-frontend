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
import { DEFAULT_AAVE_CHAIN_ID } from "@/modules/explore/constants/aave.constants";
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
  const aaveMarket = useAaveMarket(
    isAaveUsdcMarket ? accountInfo.evmSmartAccount || undefined : undefined,
    chainId,
    isAaveUsdcMarket,
  );
  const tokenRows = React.useMemo(
    () => normalizePrimaryAssetTokens(primaryAssets, true),
    [primaryAssets],
  );

  const liveMarket = isAaveUsdcMarket && aaveMarket.data
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
  const hasAaveData = isAaveUsdcMarket && Boolean(aaveMarket.data);
  const hasLiveData = hasCatalogData || hasAaveData;
  const isDetailLoading = !hasLiveData
    && (catalogDetail.isLoading || (isAaveUsdcMarket && aaveMarket.isLoading));
  const detailError = !hasLiveData && !isDetailLoading
    ? (isAaveUsdcMarket ? aaveMarket.error : null) || catalogDetail.error || "Live market data is unavailable."
    : null;
  const hasApyChart = liveMarket.chartData[range].length > 1;
  const hasTvlChart = catalogDetail.metadata.tvlChart[range].length > 1;
  const heroTvl = aaveMarket.data && aaveMarket.data.tvl > 0
    ? formatUsdValue(aaveMarket.data.tvl)
    : catalogDetail.metadata.currentTvl !== null
      ? formatUsdValue(catalogDetail.metadata.currentTvl)
      : liveMarket.tvl || "Unavailable";
  const executionAssetSymbol = catalogDetail.metadata.executionAssetSymbol || "USDC";
  const universalAssetBalance = tokenRows
    .filter((token) => token.symbol.toUpperCase() === executionAssetSymbol.toUpperCase())
    .reduce((total, token) => total + token.balance, 0);
  const canExecuteYield = Boolean(executionMarketId) && catalogDetail.metadata.executionEnabled;
  const tone = liveMarket.risk === "High" ? "red" : liveMarket.risk === "Medium" ? "yellow" : "green";

  async function refreshAll() {
    await Promise.all([
      catalogDetail.refresh(),
      isAaveUsdcMarket ? aaveMarket.refresh() : Promise.resolve(null),
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
          {catalogDetail.error && !isAaveUsdcMarket ? (
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
          ) : market.category === "Yield" ? (
            <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5">
              <Typography as="h2" variant="h4">Deposit and withdraw</Typography>
              <Typography variant="body-sm" color="muted" className="mt-1.5">This live pool remains available for analysis, but its exact contract has not passed the mom3 execution allowlist.</Typography>
              <Button type="button" color="dark" size="lg" rounded="full" fullWidth className="mt-3" isDisabled label="Execution unavailable" startIcon="lucide:shield-alert" />
            </section>
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
              {[["Risk", liveMarket.risk], ["Utilization", liveMarket.utilization], ["Outlook", catalogDetail.metadata.predictionClass || liveMarket.secondary]].map(([label, value], index) => (
                <div key={label} className={cn("p-3", index < 2 && "border-r border-white/10")}><dt className="font-medium text-[#A7A7B7]">{label}</dt><dd className="mt-1.5 font-mono font-black text-white">{value}</dd></div>
              ))}
            </dl>
            {hasCatalogData ? (
              <details className="group mt-3 border-t border-white/10 pt-2">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-1 text-sm font-bold text-[#C8C8CE] focus-visible:ring-2 focus-visible:ring-[#ccff00]">View full analysis<AppIcon icon="lucide:chevron-down" aria-hidden="true" width={18} height={18} className="transition-transform group-open:rotate-180" /></summary>
                <dl className="space-y-3 px-1 pb-1 pt-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-[#A7A7B7]">Risk score</dt><dd className="font-mono font-bold text-white">{catalogDetail.metadata.riskScore === null ? "Unavailable" : `${catalogDetail.metadata.riskScore.toFixed(1)}/10`}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#A7A7B7]">Market outlook</dt><dd className="text-right font-bold text-white">{catalogDetail.metadata.predictionClass || "Unavailable"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#A7A7B7]">Confidence</dt><dd className="font-mono font-bold text-white">{catalogDetail.metadata.predictionProbability === null ? "Unavailable" : `${catalogDetail.metadata.predictionProbability.toFixed(0)}%`}</dd></div>
                </dl>
              </details>
            ) : null}
          </section>
        </>
      )}
    </MobileShell>
  );
}
