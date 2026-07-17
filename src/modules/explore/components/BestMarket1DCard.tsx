"use client";

import Link from "next/link";
import * as React from "react";

import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils";
import type { ExploreYieldPool } from "@/modules/explore/hooks/useExploreYields";

type BestMarket1DCardProps = {
  markets: ExploreYieldPool[];
  hrefFor: (market: ExploreYieldPool) => string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function percent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function BestMarket1DCard({ markets, hrefFor }: BestMarket1DCardProps) {
  const topMarkets = React.useMemo(
    () => [...markets].sort((left, right) => (right.apyChange1d ?? -Infinity) - (left.apyChange1d ?? -Infinity)).slice(0, 10),
    [markets],
  );

  if (!topMarkets.length) return null;

  return (
    <section className="mt-4 overflow-hidden rounded-[28px] border border-[#ccff00]/15 bg-[#171819] p-4" aria-labelledby="best-market-1d-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ccff00]/10 text-[#ccff00]">
              <AppIcon icon="solar:graph-up-bold" aria-hidden="true" width={19} height={19} />
            </span>
            <div>
              <h2 id="best-market-1d-title" className="text-base font-black text-white">Best market in 1D</h2>
              <p className="text-xs font-medium text-[#8E8E93]">Top {topMarkets.length} live APY movers</p>
            </div>
          </div>
        </div>
        <span className="rounded-full bg-[#ccff00]/10 px-2.5 py-1 text-[10px] font-black text-[#ccff00]">LIVE</span>
      </div>

      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1">
        {topMarkets.map((market, index) => (
          <Link
            key={market.id}
            href={hrefFor(market)}
            className="min-w-[274px] snap-start rounded-[22px] border border-white/[0.07] bg-[#202124] p-3 transition-colors hover:border-[#ccff00]/35 focus-visible:ring-2 focus-visible:ring-[#ccff00]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#ccff00]">#{index + 1} · {market.strategy}</p>
                <h3 className="mt-1 truncate text-base font-black text-white">{market.asset}</h3>
                <p className="truncate text-xs font-medium text-[#8E8E93]">{market.protocol} · {market.chain}</p>
              </div>
              <AppIcon icon="lucide:arrow-up-right" aria-hidden="true" width={17} height={17} className="shrink-0 text-[#ccff00]" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-black/20 p-2.5">
                <p className="text-[10px] font-bold text-[#8E8E93]">APY</p>
                <p className="mt-1 text-sm font-black text-white">{market.apy.toFixed(2)}%</p>
              </div>
              <div className="rounded-xl bg-black/20 p-2.5">
                <p className="text-[10px] font-bold text-[#8E8E93]">APY 1D</p>
                <p className={cn("mt-1 text-sm font-black", (market.apyChange1d ?? 0) >= 0 ? "text-[#ccff00]" : "text-[#FF8B8B]")}>{percent(market.apyChange1d ?? 0)}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-2.5">
                <p className="text-[10px] font-bold text-[#8E8E93]">Est. PnL 1D / $1k</p>
                <p className="mt-1 text-sm font-black text-white">{money(market.estimatedPnl1dPer1k)}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-2.5">
                <p className="text-[10px] font-bold text-[#8E8E93]">TVL · Risk</p>
                <p className="mt-1 truncate text-sm font-black text-white">{market.tvl} · {market.risk}</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] font-bold text-[#8E8E93]">{market.executionEnabled ? "Ready for verified execution" : "Discovery market · execution unavailable"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
