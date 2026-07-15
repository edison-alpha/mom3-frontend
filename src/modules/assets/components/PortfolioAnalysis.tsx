"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  PortfolioIndicator,
  PortfolioRecommendation,
  PortfolioSummary,
} from "@/modules/assets/types/portfolio.types";

const toneClass = {
  positive: "bg-[#ccff00]/10 text-[#ccff00]",
  warning: "bg-amber-400/10 text-amber-200",
  critical: "bg-red-500/10 text-red-100",
  neutral: "bg-white/[0.06] text-[#C8C8CE]",
} as const;

export function PortfolioAnalysisSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Analyzing portfolio">
      <section className="rounded-[22px] border border-white/10 bg-[#111217] p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><SkeletonText className="h-4 w-36" /><SkeletonText className="h-3 w-48" /></div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-16 rounded-2xl" />
      </section>
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[18px]" />)}
      </div>
    </div>
  );
}

export function PortfolioAnalysis({
  summary,
  indicators,
  recommendations,
  error,
  isRefreshing,
  updatedAt,
  onRetry,
}: {
  summary: PortfolioSummary;
  indicators: PortfolioIndicator[];
  recommendations: PortfolioRecommendation[];
  error: string | null;
  isRefreshing: boolean;
  updatedAt: string | null;
  onRetry: () => void;
}) {
  if (error && indicators.length === 0) {
    return (
      <section className="rounded-[22px] border border-red-400/20 bg-red-500/10 p-4" role="alert">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-100">
            <AppIcon icon="lucide:triangle-alert" aria-hidden="true" width={20} height={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-red-50">Analysis temporarily unavailable</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-red-100/80">Your balances are still visible. Retry the portfolio engine when the service reconnects.</p>
          </div>
        </div>
        <Button type="button" color="danger" size="compact" rounded="full" className="mt-3" label="Retry analysis" onClick={onRetry} />
      </section>
    );
  }

  if (summary.totalValue <= 0) {
    return (
      <section className="rounded-[22px] border border-white/10 bg-[#111217] p-6 text-center">
        <AppIcon icon="solar:chart-square-bold" aria-hidden="true" width={32} height={32} className="mx-auto text-[#8F89FF]" />
        <p className="mt-3 text-sm font-black text-white">Analysis starts after your first deposit</p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-[#A7A7B7]">Mom3 will monitor concentration, yield quality, liquidity, and cross-chain risk automatically.</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <section className="rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(59,51,189,0.32),rgba(17,18,23,1)_48%)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">Mom3 Intelligence</h2>
              <span className="flex items-center gap-1 rounded-full bg-[#ccff00]/10 px-2 py-1 text-[10px] font-black text-[#ccff00]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]" /> Live
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-[#A7A7B7]">
              {updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Cross-chain analysis"}
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            aria-label="Refresh portfolio analysis"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          >
            <AppIcon icon="lucide:refresh-cw" aria-hidden="true" width={18} height={18} className={cn(isRefreshing && "animate-spin motion-reduce:animate-none")} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[18px] bg-black/25">
          {[
            ["Health", String(summary.healthScore)],
            ["Risk", summary.riskLevel],
            ["Net APY", summary.netApy > 0 ? `${summary.netApy.toFixed(2)}%` : "—"],
          ].map(([label, value], index) => (
            <div key={label} className={cn("p-3", index < 2 && "border-r border-white/10")}>
              <p className="text-[11px] font-semibold text-[#A7A7B7]">{label}</p>
              <p className="mt-1 text-base font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div>
        <h3 className="px-1 text-xs font-black uppercase tracking-[0.08em] text-[#8F8F96]">Smart indicators</h3>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {indicators.map((indicator) => (
            <article key={indicator.id} className="rounded-[18px] border border-white/10 bg-[#111217] p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-[#A7A7B7]">{indicator.label}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-black", toneClass[indicator.tone])}>{indicator.score}</span>
              </div>
              <p className="mt-2 text-sm font-black text-white">{indicator.value}</p>
              <p className={cn("mt-1 text-[11px] font-bold", toneClass[indicator.tone].split(" ").at(-1))}>{indicator.status}</p>
              <details className="group mt-2">
                <summary className="min-h-10 cursor-pointer list-none py-2 text-[11px] font-bold text-[#8F8F96] focus-visible:ring-2 focus-visible:ring-[#3B33BD]">Why this score</summary>
                <p className="pb-1 text-[11px] font-medium leading-relaxed text-[#A7A7B7]">{indicator.detail}</p>
              </details>
            </article>
          ))}
        </div>
      </div>

      {recommendations.length > 0 ? (
        <section className="rounded-[22px] border border-white/10 bg-[#111217] p-3.5">
          <h3 className="text-sm font-black text-white">Recommended next steps</h3>
          <div className="mt-3 space-y-3">
            {recommendations.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className={cn(
                  "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  item.priority === "high" ? "bg-red-400" : item.priority === "medium" ? "bg-amber-300" : "bg-[#ccff00]",
                )} />
                <div>
                  <p className="text-xs font-black text-white">{item.title}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[#A7A7B7]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
