"use client";

import { AppIcon } from "@/components/ui/app-icon";
import Link from "next/link";
import * as React from "react";

import { MiniChart, TimeRangeControl, type TimeRange } from "@/components/ui/mini-chart";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { cn } from "@/lib/utils";
import type { AssetDetail } from "@/lib/portfolio-data";

export default function AssetDetailView({ asset }: { asset: AssetDetail }) {
  const [range, setRange] = React.useState<TimeRange>("1W");
  const tone = asset.change.startsWith("-") ? "red" : "green";

  return (
    <MobileShell>
        <MobilePageHeader title={asset.symbol} backHref="/assets" backLabel="Back to assets" />

        <section className="mt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08]">
              <AppIcon icon={asset.icon} className="h-8 w-8" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-black text-white">{asset.name}</h2>
              <p className="mt-0.5 text-xs font-medium text-[#8F8F96]">
                {asset.amount} on {asset.chain}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-black",
                tone === "green" ? "bg-[#ccff00]/10 text-[#ccff00]" : "bg-[#FF6B6B]/10 text-[#FF6B6B]",
              )}
            >
              {asset.change}
            </span>
          </div>

          <p className="mt-5 text-4xl font-black tracking-tight text-white">
            {asset.value}
          </p>
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#A7A7B7]">
            {asset.detail}
          </p>
        </section>

        <section className="mt-4">
          <TimeRangeControl value={range} onChange={setRange} />
          <MiniChart
            values={asset.chartData[range]}
            label={`${asset.symbol} market performance`}
            tone={tone}
            range={range}
            className="mt-3"
          />
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            ["Price", asset.price],
            ["Avg cost", asset.avgCost],
            ["Allocation", asset.allocation],
            ["Network", asset.chain],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[18px] border border-white/10 bg-[#111217] p-3">
              <p className="text-xs font-medium text-[#A7A7B7]">{label}</p>
              <p className="mt-1.5 text-base font-black text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B33BD]/20 text-[#ccff00]">
              <AppIcon icon="solar:shield-check-bold" aria-hidden="true" width={21} height={21} />
            </span>
            <div>
              <h2 className="text-sm font-black text-white">Portfolio role</h2>
              <p className="mt-1 text-xs font-medium text-[#A7A7B7]">
                Used for deposits, yield routing, and balancing risk.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/send"
            className="flex h-12 items-center justify-center rounded-full bg-[#ccff00] text-sm font-black text-[#3B33BD] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/70"
          >
            Send asset
          </Link>
          <Link
            href={`/send?asset=${encodeURIComponent(asset.symbol)}&chain=${encodeURIComponent(asset.chain)}`}
            className="flex h-12 items-center justify-center rounded-full bg-[#1C1C1E] text-sm font-black text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          >
            Send
          </Link>
        </div>
    </MobileShell>
  );
}
