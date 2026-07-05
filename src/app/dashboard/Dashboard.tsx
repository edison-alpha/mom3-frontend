"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { FloatingMenuButton } from "@/components/ui/menu-button";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Coins,
  Eye,
  EyeOff,
  RefreshCw,
  Sprout,
} from "lucide-react";

function AvatarStack({ label }: { label: string }) {
  const colors = ["bg-[#ccff00]", "bg-[#3B33BD]", "bg-[#ff7a45]"];

  return (
    <div className="mt-4 flex items-center">
      <div className="flex -space-x-2">
        {colors.map((color, index) => (
          <span
            key={color}
            className={`h-6 w-6 rounded-full border-2 border-[#1C1C1E] ${color}`}
            aria-hidden="true"
          >
            <span className="sr-only">User {index + 1}</span>
          </span>
        ))}
      </div>
      <span className="ml-2.5 text-[11px] font-semibold text-[#9A9AA2]">
        {label}
      </span>
    </div>
  );
}

function DegenDogeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="24" cy="24" r="20" fill="#D9A441" />
      <path d="M12 20 6 10l13 5" fill="#C9862A" />
      <path d="m36 20 6-10-13 5" fill="#C9862A" />
      <path d="M14 29c2.2 6 17.8 6 20 0" stroke="#7A4517" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M23 25h2l-1 1.4L23 25Z" fill="#5B3212" />
      <path d="M13 20h10v6H13zM25 20h10v6H25z" fill="#0A0A0A" />
      <path d="M23 22h2" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 21.5h6M27 21.5h6" stroke="#ccff00" strokeWidth="1.4" strokeLinecap="round" opacity=".9" />
      <path d="M17 31c2.7 2.7 11.3 2.7 14 0" stroke="#FFF2C2" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const portfolioModes = [
  {
    label: "Degen",
    icon: "degen-doge",
    title: "Chase higher APY",
    description: "Aggressive yield routes with tighter health checks.",
    metric: "11.2%",
    tone: "High risk",
  },
  {
    label: "Balanced",
    icon: "solar:scale-bold",
    title: "Optimize steady growth",
    description: "Mix stable lending and selective yield positions.",
    metric: "5.9%",
    tone: "Medium risk",
  },
  {
    label: "Safe",
    icon: "solar:shield-check-bold",
    title: "Protect capital",
    description: "Prioritize blue-chip markets and low volatility.",
    metric: "4.8%",
    tone: "Low risk",
  },
];

type CurrencyCode = "USD" | "IDR" | "EUR";

const currencyOptions: Record<
  CurrencyCode,
  { label: CurrencyCode; locale: string; rate: number }
> = {
  USD: { label: "USD", locale: "en-US", rate: 1 },
  IDR: { label: "IDR", locale: "id-ID", rate: 17900 },
  EUR: { label: "EUR", locale: "de-DE", rate: 0.92 },
};

function formatCurrency(amountUsd: number, currency: CurrencyCode) {
  const option = currencyOptions[currency];

  return new Intl.NumberFormat(option.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
    minimumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(amountUsd * option.rate);
}

export default function Dashboard() {
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [hasAssets, setHasAssets] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    setHasAssets(localStorage.getItem("mom3-demo-balance") === "1");
    setMounted(true);
  }, []);

  const activeMode = portfolioModes[activeModeIndex];
  const balanceValue = hasAssets ? 2500 : 0;
  const pnlValue = hasAssets ? 42.3 : -0.675;
  const balanceDisplay = formatCurrency(balanceValue, currency);
  const pnlDisplay = formatCurrency(Math.abs(pnlValue), currency);

  return (
    <main className="min-h-screen w-full bg-black font-sans text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full flex-col px-5 pt-4 pb-28 sm:max-w-md">
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3B33BD] via-[#5A52D4] to-[#7E78EA]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black">@ubayy</span>
                <Icon
                  icon="material-symbols:verified-rounded"
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className="text-[#ccff00]"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrencyOpen((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1C1C1E] px-3 text-xs font-bold text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
              aria-label="Select wallet currency"
              aria-expanded={currencyOpen}
              aria-haspopup="menu"
            >
              <Icon
                icon="ic:twotone-wallet"
                aria-hidden="true"
                width={20}
                height={20}
              />
              {currency}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-[#9A9AA2] transition-transform",
                  currencyOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>

            {currencyOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-12 z-30 w-32 overflow-hidden rounded-2xl border border-white/10 bg-[#16161A]/95 p-1.5 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.75)] backdrop-blur-xl"
              >
                {(Object.keys(currencyOptions) as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setCurrency(code);
                      setCurrencyOpen(false);
                    }}
                    className={cn(
                      "flex h-9 w-full items-center justify-between rounded-xl px-3 text-xs font-bold transition-colors",
                      currency === code
                        ? "bg-[#3B33BD] text-[#ccff00]"
                        : "text-white/75 hover:bg-white/[0.08] hover:text-white"
                    )}
                  >
                    {code}
                    {currency === code ? (
                      <Icon
                        icon="material-symbols:check-rounded"
                        width={17}
                        height={17}
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </motion.header>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
          className="relative mt-5 overflow-hidden rounded-[28px] bg-[#3B33BD] p-5 text-center shadow-[0_12px_40px_-12px_rgba(59,51,189,0.35)]"
        >
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
                onClick={() => setBalanceHidden((value) => !value)}
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
              {!mounted || balanceHidden ? "****" : balanceDisplay}
            </p>

            <p
              className={cn(
                "mt-1 flex items-center justify-center gap-2 text-xs font-semibold",
                !mounted || balanceHidden
                  ? "text-black/60"
                  : hasAssets
                    ? "text-[#ccff00]"
                    : "text-[#b91c1c]"
              )}
            >
              <span>{!mounted || balanceHidden ? "****" : `${pnlValue >= 0 ? "+" : "-"}${pnlDisplay}`}</span>
              <span className={cn("rounded-md px-1.5 py-0.5", !mounted || balanceHidden ? "bg-black/10" : hasAssets ? "bg-[#ccff00]/15" : "bg-[#b91c1c]/15")}>
                {!mounted || balanceHidden ? "***" : (hasAssets ? "+1.72%" : "-100%")}
              </span>
            </p>

            <p className="mt-2 text-sm font-medium leading-snug text-white/80">
              {hasAssets
                ? "Your portfolio is growing today."
                : <>Add your assets to start<br />using mom3</>}
            </p>

            {hasAssets ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Link
                  href="#"
                  className="flex flex-col items-center justify-center gap-2 rounded-[18px] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ccff00] text-[#3B33BD]">
                    <ArrowDown className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-white">Deposit</span>
                </Link>
                <Link
                  href="/convert"
                  className="flex flex-col items-center justify-center gap-2 rounded-[18px] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#242426] text-white">
                    <RefreshCw className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-white">Convert</span>
                </Link>
                <Link
                  href="/send"
                  className="flex flex-col items-center justify-center gap-2 rounded-[18px] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#242426] text-white">
                    <ArrowUp className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-white">Send</span>
                </Link>
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
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
          className="mt-4 rounded-[22px] border border-white/10 bg-[#1C1C1E] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Strategy mode</h2>
              <p className="text-[11px] font-medium text-[#9A9AA2]">
                Pick how aggressive mom3 should be.
              </p>
            </div>
            <span className="rounded-full bg-[#3B33BD]/20 px-2.5 py-1 text-[11px] font-black text-[#ccff00]">
              {activeMode.metric}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {portfolioModes.map((mode, index) => {
              const isActive = index === activeModeIndex;

              return (
                <motion.button
                  key={mode.label}
                  type="button"
                  onClick={() => setActiveModeIndex(index)}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "flex h-10 items-center justify-center gap-1 rounded-full text-[11px] font-black transition-all duration-500 focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
                    isActive
                      ? "scale-[1.02] bg-[#3B33BD] text-[#ccff00] shadow-[0_10px_24px_-16px_rgba(59,51,189,0.9)]"
                      : "bg-[#111113] text-[#8E8E98] hover:bg-white/5 hover:text-white"
                  )}
                >
                  {mode.icon === "degen-doge" ? (
                    <DegenDogeIcon className="h-4 w-4" />
                  ) : (
                    <Icon icon={mode.icon} aria-hidden="true" width={14} height={14} />
                  )}
                  {mode.label}
                </motion.button>
              );
            })}
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-2.5 rounded-[18px] border border-white/10 bg-[linear-gradient(115deg,#17181d_0%,#111216_100%)] p-2.5"
          >
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B33BD]/20 text-[#ccff00]">
                {activeMode.icon === "degen-doge" ? (
                  <DegenDogeIcon className="h-7 w-7" />
                ) : (
                  <Icon icon={activeMode.icon} aria-hidden="true" width={19} height={19} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-white">
                  {activeMode.title}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium leading-snug text-[#9A9AA2]">
                  {activeMode.description}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-[#9A9AA2]">
                {activeMode.tone}
              </span>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
          className="mt-4 grid grid-cols-2 gap-2.5"
        >
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="rounded-[22px] bg-[#1C1C1E] p-3.5 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#202024]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A3E] text-[#ccff00] transition-transform duration-500 hover:rotate-6">
                <Sprout className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-white">Yield</p>
            </div>
            <p className="mt-3 text-sm font-bold leading-tight text-white">
              Grow Your Assets
            </p>
            <p className="mt-1 text-xs font-medium leading-snug text-[#9A9AA2]">
              With optimal yield
            </p>
            <AvatarStack label="12k+ user earning" />
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.97 }}
            className="rounded-[22px] bg-[#1C1C1E] p-3.5 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#202024]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A3E] text-[#ccff00] transition-transform duration-500 hover:rotate-6">
                <Coins className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold leading-tight text-white">
                Lend & Borrow
              </p>
            </div>
            <p className="mt-3 text-sm font-bold leading-tight text-white">
              Unlock Liquidity
            </p>
            <p className="mt-1 text-xs font-medium leading-snug text-[#9A9AA2]">
              With flexible rates
            </p>
            <AvatarStack label="12k+ user borrowing" />
          </motion.div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.32, ease: "easeOut" }}
          className="mt-6"
        >
          <h2 className="text-base font-semibold text-white">Earn with mom3</h2>

          <div className="mt-3 space-y-3">
            <Link
              href="/assets"
              className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[linear-gradient(115deg,#17181d_0%,#111216_100%)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-white">Your Assets</span>
                <span className="mt-1 block text-sm font-medium text-[#9A9AA2]">
                  Manage and track your portfolio
                </span>
              </span>
              <span className="hidden rounded-full border border-[#3B33BD]/25 bg-[#15142a] px-3 py-1.5 text-xs font-bold text-[#3B33BD] min-[390px]:inline-flex">
                {formatCurrency(2500, currency)}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
            </Link>

            <Link
              href="/ai"
              className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[linear-gradient(115deg,#17181d_0%,#111216_100%)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-base font-bold text-white">
                    AI Rebalancing
                  </span>
                  <span className="rounded-full bg-[#3B33BD]/20 px-2.5 py-1 text-[10px] font-black uppercase text-[#8F89FF]">
                    Beta
                  </span>
                </span>
                <span className="mt-1 block text-sm font-medium text-[#9A9AA2]">
                  Optimize your portfolio with AI
                </span>
              </span>
              <span className="hidden rounded-full border border-[#ccff00]/20 bg-[#1d250b] px-3 py-1.5 text-xs font-bold text-[#ccff00] min-[390px]:inline-flex">
                Smart
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
            </Link>
          </div>
        </motion.section>
        <div className="flex-1" />
      </div>
      <FloatingMenuButton activeHref="/dashboard" />
    </main>
  );
}
