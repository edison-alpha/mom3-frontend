import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, RefreshCw } from "lucide-react";

import { quickActionLinks } from "../constants/dashboard";
import type { QuickActionLink } from "../types/dashboard.types";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";

type BalanceCardProps = {
  balanceDisplay: string;
  balanceHidden: boolean;
  hasAssets: boolean;
  isBalanceLoading: boolean;
  mounted: boolean;
  pnlDisplay: string;
  pnlValue: number;
  pnlPercent: number;
  performanceHasRealData: boolean;
  isPerformanceLoading: boolean;
  onToggleBalance: () => void;
};

function ActionIcon({ icon }: Pick<QuickActionLink, "icon">) {
  if (icon === "deposit") {
    return <ArrowDown className="h-5 w-5" strokeWidth={3} aria-hidden="true" />;
  }

  if (icon === "send") {
    return <ArrowUp className="h-5 w-5" strokeWidth={3} aria-hidden="true" />;
  }

  return <RefreshCw className="h-5 w-5" aria-hidden="true" />;
}

export function BalanceCard({
  balanceDisplay,
  balanceHidden,
  hasAssets,
  isBalanceLoading,
  mounted,
  pnlDisplay,
  pnlValue,
  pnlPercent,
  performanceHasRealData,
  isPerformanceLoading,
  onToggleBalance,
}: BalanceCardProps) {
  return (
    <section className="relative mt-5 overflow-hidden rounded-[28px] bg-[#3B33BD] p-5 text-center shadow-[0_12px_40px_-12px_rgba(59,51,189,0.35)]">
      <Image
        src="/shadow.png"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 448px"
        className="pointer-events-none absolute inset-0 z-0 object-cover opacity-30"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-white/25 blur-[56px]" />
      <div className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[#3B33BD]/15 blur-[52px]" />

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white/75">
          <span>Total Balance</span>
          <Button
            type="button"
            onClick={onToggleBalance}
            color="plain"
            size="icon-xs"
            rounded="full"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#ccff00]/80 transition-colors hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-[#3B33BD]/30"
            aria-label={balanceHidden ? "Show balance" : "Hide balance"}
          >
            {balanceHidden ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        <Typography
          key={balanceDisplay}
          variant="numeric"
          as="p"
          align="center"
          className="balance-value-transition mt-0.5 text-white"
          aria-live="polite"
        >
          {!mounted || balanceHidden
            ? "****"
            : isBalanceLoading
              ? "—"
              : balanceDisplay}
        </Typography>

        <p
          className={cn(
            "mt-1 flex items-center justify-center gap-2 text-xs font-semibold",
            !mounted || balanceHidden || isBalanceLoading
              ? "text-black/60"
              : "text-white/70",
          )}
        >
          <span className={cn(
            pnlValue > 0 ? "text-[#ccff00]" : pnlValue < 0 ? "text-red-300" : "text-white/70",
          )}>
            {!mounted || balanceHidden || isBalanceLoading
              ? "****"
              : performanceHasRealData ? `${pnlValue >= 0 ? "+" : "-"}${pnlDisplay}` : "—"}
          </span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5",
              pnlPercent > 0 ? "text-[#ccff00]" : pnlPercent < 0 ? "text-red-300" : "text-white/70",
              !mounted || balanceHidden || isBalanceLoading
                ? "bg-black/10"
                : "bg-white/10",
            )}
          >
            {!mounted || balanceHidden || isBalanceLoading || isPerformanceLoading || !performanceHasRealData ? "—" : `${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%`}
          </span>
        </p>

        <Typography variant="body-sm" color="inherit" align="center" className="mt-2 text-white/80">
          {!mounted ? (
            <>
              Add your assets to start
              <br />
              using mom3
            </>
          ) : hasAssets && performanceHasRealData ? (
            pnlValue > 0 ? "Your portfolio received more value today." : pnlValue < 0 ? "Your portfolio has net outflows today." : "Your portfolio is unchanged today."
          ) : hasAssets ? (
            "Your portfolio performance will appear after activity sync."
          ) : (
            <>
              Add your assets to start
              <br />
              using mom3
            </>
          )}
        </Typography>

        {hasAssets ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {quickActionLinks.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-1 text-xs font-black text-white transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B33BD]",
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full",
                    action.icon === "deposit"
                      ? "bg-[#ccff00] text-[#3B33BD]"
                      : "bg-[#242426] text-white",
                  )}
                >
                  <ActionIcon icon={action.icon} />
                </span>
                <span className="truncate">{action.label}</span>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href="/deposit"
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ccff00] px-7 py-3 text-base font-black text-[#3B33BD] shadow-[0_8px_24px_-8px_rgba(204,255,0,0.45)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/70"
          >
            <ArrowDown className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            Deposit
          </Link>
        )}
      </div>
    </section>
  );
}
