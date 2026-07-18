"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import * as React from "react";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { FloatingMenuButton } from "@/components/ui/menu-button";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { formatUsdValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AssetVisibilitySheet } from "@/modules/assets/components/AssetVisibilitySheet";
import { AssetsSkeleton } from "@/modules/assets/components/AssetsSkeleton";
import {
  PortfolioAnalysis,
  PortfolioAnalysisSkeleton,
} from "@/modules/assets/components/PortfolioAnalysis";
import { usePortfolioViewModel } from "@/modules/assets/hooks/usePortfolioViewModel";
import type { PortfolioPosition, PortfolioRisk } from "@/modules/assets/types/portfolio.types";
import { useRealtime } from "@/providers/realtime/components/RealtimeProvider";

type Tab = "assets" | "positions" | "summary";

const tabs: { id: Tab; label: string }[] = [
  { id: "assets", label: "Assets" },
  { id: "positions", label: "Positions" },
  { id: "summary", label: "Analysis" },
];

const quickActions = [
  { label: "Deposit", href: "/deposit", icon: "lucide:arrow-down", className: "bg-[#3B33BD] text-white" },
  { label: "Convert", href: "/convert", icon: "lucide:refresh-cw", className: "bg-[#242426] text-white" },
  { label: "Send", href: "/send", icon: "lucide:arrow-up", className: "bg-[#242426] text-white" },
];

const riskClassName: Record<PortfolioRisk, string> = {
  Low: "text-[#ccff00]",
  Medium: "text-[#FFD166]",
  High: "text-[#FF7B7B]",
};

const tabVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function positionHref(position: PortfolioPosition) {
  const params = new URLSearchParams({
    marketId: position.marketId,
    asset: position.asset,
    protocol: position.protocol,
    chain: position.chain,
    chainId: String(position.chainId),
    category: "Yield",
    icon: position.icon,
  });
  return `/explore/${slugify(position.marketId)}?${params.toString()}`;
}

function PositionIcon({ position }: { position: PortfolioPosition }) {
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
      <AppIcon icon={position.icon} className="h-7 w-7" aria-hidden="true" />
      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#111217]">
        <AppIcon icon={position.protocolIcon} className="h-3.5 w-3.5 text-white" aria-hidden="true" />
      </span>
    </span>
  );
}

function EmptyState({
  title,
  message,
  actionLabel = "Explore yield",
  actionHref = "/explore",
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#1F1F21] p-7 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
        <AppIcon icon="solar:wallet-bold" className="h-6 w-6 text-[#8F89FF]" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-black text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-[260px] text-xs font-medium leading-relaxed text-[#A7A7B7]">{message}</p>
      {onAction ? (
        <button type="button" onClick={onAction} className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#ccff00] px-5 text-sm font-black text-[#16162a] focus-visible:ring-2 focus-visible:ring-[#ccff00]">{actionLabel}</button>
      ) : (
        <Link href={actionHref} className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#ccff00] px-5 text-sm font-black text-[#16162a] focus-visible:ring-2 focus-visible:ring-[#ccff00]">{actionLabel}</Link>
      )}
    </div>
  );
}

function PositionListSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] bg-[#1F1F21]" role="status" aria-label="Scanning protocol positions">
      {Array.from({ length: 3 }).map((_, index) => <SkeletonListRow key={index} className="border-b border-white/[0.06] last:border-b-0" />)}
      <span className="sr-only">Scanning Aave, Compound, and Morpho positions</span>
    </div>
  );
}

export default function AssetsView() {
  const portfolio = usePortfolioViewModel();
  const { status: realtimeStatus } = useRealtime();
  const [activeTab, setActiveTab] = React.useState<Tab>("assets");
  const [visibilityOpen, setVisibilityOpen] = React.useState(false);

  const cta = activeTab === "positions"
    ? portfolio.positions.length > 0
      ? { label: "Optimize with AI", href: "/ai/strategy", icon: "lucide:arrow-right" }
      : { label: "Explore Yield", href: "/explore", icon: "lucide:search" }
    : activeTab === "summary"
      ? { label: "Open AI Strategy", href: "/ai/strategy", icon: "solar:stars-bold" }
      : { label: "Add Assets", href: "/deposit", icon: "lucide:plus" };
  const targetHealthScore = Number.isFinite(portfolio.summary.healthScore)
    ? Math.max(0, Math.min(100, portfolio.summary.healthScore))
    : 0;
  const [displayedHealthScore, setDisplayedHealthScore] = React.useState(targetHealthScore);
  const previousHealthScoreRef = React.useRef(targetHealthScore);
  React.useEffect(() => {
    const from = previousHealthScoreRef.current;
    const to = targetHealthScore;
    if (Math.abs(from - to) < 0.01) {
      previousHealthScoreRef.current = to;
      setDisplayedHealthScore(to);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const duration = 650;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (to - from) * eased;
      previousHealthScoreRef.current = value;
      setDisplayedHealthScore(value);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else previousHealthScoreRef.current = to;
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetHealthScore]);
  if (portfolio.isLoading) return <AssetsSkeleton />;

  const healthNeedleAngle = 180 - displayedHealthScore * 1.8;
  const selectedTokenCount = portfolio.visibility.allTokens.filter(
    (token) => !portfolio.visibility.hiddenAssetIds.has(token.id),
  ).length;
  const headerAction = (
    <Button
      type="button"
      color="dark"
      size="icon"
      rounded="full"
      startIcon="lucide:sliders-horizontal"
      onClick={() => setVisibilityOpen(true)}
      aria-label="Manage visible assets"
      aria-haspopup="dialog"
      aria-expanded={visibilityOpen}
      className="h-10 w-10"
    />
  );

  return (
    <MobileShell bottomSlot={<FloatingMenuButton />}>
      <MobilePageHeader title="My Assets" backHref="/dashboard" backLabel="Back to dashboard" action={headerAction} />

      <section className="mt-6 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,51,189,0.34),rgba(17,18,23,1)_58%)] p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[#8F8F96]">Portfolio value</p>
          <span className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase",
            realtimeStatus === "connected" ? "bg-[#ccff00]/10 text-[#ccff00]" : "bg-amber-400/10 text-amber-200",
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", realtimeStatus === "connected" ? "bg-[#ccff00]" : "bg-amber-300")} />
            {realtimeStatus === "connected" ? "Live" : "Syncing"}
          </span>
        </div>
        <p className="mt-1 text-4xl font-bold tracking-tight text-white">{portfolio.summary.totalDisplay}</p>
        <p className="mx-auto mt-2 max-w-[290px] text-sm font-medium leading-snug text-[#A7A7B7]">
          {portfolio.summary.assetCount} valued assets across {portfolio.summary.chainCount} chain{portfolio.summary.chainCount === 1 ? "" : "s"} · {portfolio.summary.stableAllocation.toFixed(0)}% stable
        </p>

        <div className="relative mx-auto mt-4 flex h-36 w-56 items-end justify-center" aria-label={`Portfolio health ${Math.round(displayedHealthScore)} out of 100`}>
          <svg viewBox="0 0 200 140" className="h-36 w-56" aria-hidden="true">
            <defs>
              <linearGradient id="assets-gauge-risk" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF4444" /><stop offset="100%" stopColor="#FF6B35" /></linearGradient>
              <linearGradient id="assets-gauge-watch" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFB020" /><stop offset="100%" stopColor="#FFD166" /></linearGradient>
              <linearGradient id="assets-gauge-strong" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#86EF5C" /><stop offset="100%" stopColor="#ccff00" /></linearGradient>
            </defs>
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1C1C1E" strokeWidth="14" strokeLinecap="round" />
            <path d="M 20 100 A 80 80 0 0 1 75.3 23.9" fill="none" stroke="url(#assets-gauge-risk)" strokeWidth="14" strokeLinecap="round" />
            <path d="M 75.3 23.9 A 80 80 0 0 1 147 35.3" fill="none" stroke="url(#assets-gauge-watch)" strokeWidth="14" strokeLinecap="round" />
            <path d="M 147 35.3 A 80 80 0 0 1 180 100" fill="none" stroke="url(#assets-gauge-strong)" strokeWidth="14" strokeLinecap="round" />
            <line x1="100" y1="100" x2={100 + 65 * Math.cos((healthNeedleAngle * Math.PI) / 180)} y2={100 - 65 * Math.sin((healthNeedleAngle * Math.PI) / 180)} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="100" r="5" fill="white" />
            <text x="100" y="126" textAnchor="middle" className="fill-white text-[22px] font-black">{Math.round(displayedHealthScore)}</text>
            <text x="100" y="139" textAnchor="middle" className="fill-[#8F8F96] text-[13px] font-semibold">/ 100 health</text>
          </svg>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-4" aria-label="Asset actions">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href} className="group flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-[18px] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD] motion-reduce:transition-none">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", action.className)}><AppIcon icon={action.icon} className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-semibold text-white">{action.label}</span>
          </Link>
        ))}
      </section>

      <div className="mt-5 grid grid-cols-3 rounded-full bg-[#1C1C1E] p-1" role="tablist" aria-label="Asset views">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="plain"
            size="compact"
            rounded="full"
            label={tab.label}
            className={cn("h-9 rounded-full text-sm font-black transition-colors focus-visible:ring-2 focus-visible:ring-[#3B33BD]", activeTab === tab.id ? "bg-white text-black" : "text-[#9A9AA2] hover:text-white")}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "assets" ? (
          <motion.section key="assets" role="tabpanel" variants={tabVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="mt-4 space-y-3">
            <div className="flex min-h-10 items-center justify-between px-1">
              <p className="text-xs font-bold text-[#A7A7B7]">{portfolio.assets.length} shown · {selectedTokenCount} selected</p>
              <button type="button" onClick={() => setVisibilityOpen(true)} className="min-h-10 rounded-full px-3 text-xs font-black text-[#8F89FF] focus-visible:ring-2 focus-visible:ring-[#3B33BD]">Manage</button>
            </div>
            {portfolio.assets.length === 0 ? (
              <EmptyState title="No visible assets" message="Adjust visibility settings or deposit a token to show it here." actionLabel="Manage assets" onAction={() => setVisibilityOpen(true)} />
            ) : (
              <div className="overflow-hidden rounded-[24px] bg-[#1F1F21]">
                {portfolio.assets.map((asset, index) => (
                  <motion.div key={asset.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}>
                    <Link href={`/assets/${slugify(asset.symbol)}`} className="flex min-h-[76px] w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B33BD]">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.08]"><AppIcon icon={asset.icon} className="h-7 w-7" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-bold text-white">{asset.name}</span>
                        <span className="mt-1 block truncate text-sm font-medium text-[#8E8E93]">{asset.amount} · {asset.chain}</span>
                      </span>
                      <span className="shrink-0 text-right"><span className="block text-sm font-bold text-white">{asset.value}</span><span className="mt-1 block text-xs font-black text-[#A7A7B7]">{asset.allocation}</span></span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        ) : null}

        {activeTab === "positions" ? (
          <motion.section key="positions" role="tabpanel" variants={tabVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="mt-4 space-y-3">
            <div className="flex min-h-10 items-center justify-between px-1">
              <div>
                <p className="text-xs font-black text-white">Protocol positions</p>
                <p className="mt-0.5 text-[11px] font-semibold text-[#8F8F96]">
                  {portfolio.coverage ? `${portfolio.coverage.successful_market_reads}/${portfolio.coverage.scanned_markets} markets checked` : "Aave · Compound · Morpho"}
                </p>
              </div>
              <button type="button" onClick={() => void portfolio.refreshPortfolio()} aria-label="Refresh protocol positions" className="flex h-10 w-10 items-center justify-center rounded-full text-[#8F89FF] focus-visible:ring-2 focus-visible:ring-[#3B33BD]">
                <AppIcon icon="lucide:refresh-cw" aria-hidden="true" width={18} height={18} className={cn(portfolio.isPortfolioRefreshing && "animate-spin motion-reduce:animate-none")} />
              </button>
            </div>

            {portfolio.isPortfolioLoading ? <PositionListSkeleton /> : portfolio.analysisError && portfolio.positions.length === 0 ? (
              <section className="rounded-[22px] border border-red-400/20 bg-red-500/10 p-4" role="alert">
                <p className="text-sm font-black text-red-50">Could not scan positions</p>
                <p className="mt-1 text-xs font-medium text-red-100/80">Check Agentkit and backend connectivity, then retry.</p>
                <Button type="button" color="danger" size="compact" rounded="full" className="mt-3" label="Retry scan" onClick={() => void portfolio.refreshPortfolio()} />
              </section>
            ) : portfolio.positions.length === 0 ? (
              <EmptyState title="No active yield positions" message="Mom3 scanned every execution-ready Aave, Compound, and Morpho market for this account." />
            ) : (
              <div className="overflow-hidden rounded-[24px] bg-[#1F1F21]">
                {portfolio.positions.map((position, index) => (
                  <motion.div key={position.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <Link href={positionHref(position)} className="flex min-h-[80px] w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B33BD]">
                      <PositionIcon position={position} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2"><span className="truncate text-base font-black text-white">{position.asset}</span><span className="rounded-full bg-[#ccff00]/10 px-2 py-0.5 text-[10px] font-black text-[#ccff00]">{position.detail}</span></span>
                        <span className="mt-1 block truncate text-sm font-semibold text-[#8F8F96]">{position.protocol} · {position.chain}</span>
                      </span>
                      <span className="shrink-0 text-right"><span className="block text-base font-black text-white">{formatUsdValue(position.amountInUSD)}</span><span className={cn("mt-1 block text-xs font-bold", riskClassName[position.risk])}>{position.risk} risk</span></span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        ) : null}

        {activeTab === "summary" ? (
          <motion.section key="summary" role="tabpanel" variants={tabVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="mt-4">
            {portfolio.isPortfolioLoading ? <PortfolioAnalysisSkeleton /> : (
              <PortfolioAnalysis
                summary={portfolio.summary}
                indicators={portfolio.indicators}
                recommendations={portfolio.recommendations}
                error={portfolio.analysisError}
                isRefreshing={portfolio.isPortfolioRefreshing}
                updatedAt={portfolio.analysisUpdatedAt}
                onRetry={() => void portfolio.refreshPortfolio()}
              />
            )}
          </motion.section>
        ) : null}
      </AnimatePresence>

      <Link href={cta.href} className="mt-5 flex h-14 items-center justify-center rounded-full bg-[#ccff00] px-5 text-base font-black text-[#16162a] transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#ccff00]/70 motion-reduce:transition-none">
        {cta.label}<AppIcon icon={cta.icon} className="ml-2 h-5 w-5" aria-hidden="true" />
      </Link>

      <AssetVisibilitySheet open={visibilityOpen} onOpenChange={setVisibilityOpen} controls={portfolio.visibility} />
    </MobileShell>
  );
}
