"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Coins,
  Eye,
  EyeOff,
  PieChart,
  Sparkles,
  Sprout,
  Wallet,
  Wrench,
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

export default function Dashboard() {
  const [balanceHidden, setBalanceHidden] = useState(false);

  return (
    <main className="min-h-screen w-full bg-black font-sans text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full flex-col px-5 pt-4 pb-8 sm:max-w-md">
        <header className="flex items-center justify-between">
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

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1C1C1E] px-3 text-xs font-bold text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            aria-label="Select wallet currency"
          >
            <Wallet className="h-5 w-5" aria-hidden="true" />
            USD
            <ChevronDown className="h-3.5 w-3.5 text-[#9A9AA2]" aria-hidden="true" />
          </button>
        </header>

        <section className="relative mt-5 overflow-hidden rounded-[28px] bg-[#3B33BD] p-5 text-center shadow-[0_12px_40px_-12px_rgba(59,51,189,0.45)]">
          <Image
            src="/shadow.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 448px"
            className="pointer-events-none absolute inset-0 z-0 object-cover opacity-100"
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-[#7C73FF]/25 blur-[56px]" />
          <div className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[#5149FF]/25 blur-[52px]" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white/75">
              <span>Total Balance</span>
              <button
                type="button"
                onClick={() => setBalanceHidden((value) => !value)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
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
              {balanceHidden ? (
                "****"
              ) : (
                <>
                  <span className="align-top text-xl">$</span>00.00
                </>
              )}
            </p>

            <p className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-[#FF453A]">
              <span>{balanceHidden ? "****" : "-$00.675"}</span>
              <span className="rounded-md bg-[#FF453A]/15 px-1.5 py-0.5">-100%</span>
            </p>

            <p className="mt-2 text-sm font-medium leading-snug text-white/85">
              Add your assets to start
              <br />
              using mom3
            </p>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#D4FF00] px-7 py-3 text-base font-black text-[#3B33BD] shadow-[0_8px_24px_-8px_rgba(212,255,0,0.45)] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
            >
              <ArrowDown className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              Deposit
            </button>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-[22px] bg-[#1C1C1E] p-3.5 transition-transform active:scale-95">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A3E] text-white">
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
          </div>

          <div className="rounded-[22px] bg-[#1C1C1E] p-3.5 transition-transform active:scale-95">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A3E] text-white">
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
          </div>
        </section>

        <section className="mt-6">
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
                $2,500.00
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
            </Link>

            <Link
              href="#"
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
        </section>

        <div className="flex-1" />

        <nav className="mt-6 flex items-center justify-between">
          <div className="h-14 w-44 rounded-full bg-[#1C1C1E]" />

          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3B33BD] text-white shadow-[0_8px_24px_-8px_rgba(59,51,189,0.55)] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            aria-label="Tools"
          >
            <Wrench className="h-6 w-6" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </main>
  );
}
