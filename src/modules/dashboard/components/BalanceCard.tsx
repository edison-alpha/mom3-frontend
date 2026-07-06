import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, RefreshCw } from "lucide-react";

import { quickActionLinks } from "../constants/dashboard";
import type { QuickActionLink } from "../type/dashboard";
import { cn } from "@/lib/utils";

type BalanceCardProps = {
  balanceDisplay: string;
  balanceHidden: boolean;
  hasAssets: boolean;
  isBalanceLoading: boolean;
  mounted: boolean;
  pnlDisplay: string;
  pnlValue: number;
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
          <button
            type="button"
            onClick={onToggleBalance}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#ccff00]/80 transition-colors hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-[#3B33BD]/30"
            aria-label={balanceHidden ? "Show balance" : "Hide balance"}
          >
            {balanceHidden ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <p className="mt-0.5 text-4xl font-bold tracking-tight text-white">
          {!mounted || balanceHidden
            ? "****"
            : isBalanceLoading
              ? "Loading"
              : balanceDisplay}
        </p>

        <p
          className={cn(
            "mt-1 flex items-center justify-center gap-2 text-xs font-semibold",
            !mounted || balanceHidden || isBalanceLoading
              ? "text-black/60"
              : "text-white/70",
          )}
        >
          <span>
            {!mounted || balanceHidden || isBalanceLoading
              ? "****"
              : `${pnlValue >= 0 ? "+" : "-"}${pnlDisplay}`}
          </span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5",
              !mounted || balanceHidden || isBalanceLoading
                ? "bg-black/10"
                : "bg-white/10",
            )}
          >
            {!mounted || balanceHidden || isBalanceLoading ? "***" : "0.00%"}
          </span>
        </p>

        <p className="mt-2 text-sm font-medium leading-snug text-white/80">
          {!mounted ? (
            <>
              Add your assets to start
              <br />
              using mom3
            </>
          ) : isBalanceLoading ? (
            "Fetching your Universal Account balance."
          ) : hasAssets ? (
            "Your portfolio is growing today."
          ) : (
            <>
              Add your assets to start
              <br />
              using mom3
            </>
          )}
        </p>

        {hasAssets ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {quickActionLinks.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center justify-center gap-2 rounded-[18px] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full",
                    action.className,
                  )}
                >
                  <ActionIcon icon={action.icon} />
                </span>
                <span className="text-xs font-semibold text-white">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ccff00] px-7 py-3 text-base font-black text-[#3B33BD] shadow-[0_8px_24px_-8px_rgba(204,255,0,0.45)] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/70"
          >
            <ArrowDown className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            Deposit
          </button>
        )}
      </div>
    </section>
  );
}
