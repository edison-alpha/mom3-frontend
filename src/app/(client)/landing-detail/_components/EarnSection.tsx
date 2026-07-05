"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import * as React from "react";

import PhoneMock from "./PhoneMock";

const OPPORTUNITIES = [
  {
    label: "USDC on Aave",
    sub: "Low risk lending",
    amount: "5.15%",
    icon: "simple-icons:aave",
    iconClassName: "text-[#B650F2]",
  },
  {
    label: "USDT on Morpho",
    sub: "Stablecoin supply",
    amount: "4.88%",
    icon: "simple-icons:morpho",
    iconClassName: "text-[#2E5BFF]",
  },
  {
    label: "USDe strategy",
    sub: "AI monitored yield",
    amount: "8.40%",
    icon: "token-branded:ethena",
    iconClassName: "",
  },
  {
    label: "USDC on Uniswap",
    sub: "LP yield market",
    amount: "6.44%",
    icon: "simple-icons:uniswap",
    iconClassName: "text-[#FF007A]",
  },
  {
    label: "PT-sUSDe on Pendle",
    sub: "Fixed yield route",
    amount: "11.20%",
    icon: "simple-icons:pendle",
    iconClassName: "text-[#21D3AE]",
  },
  {
    label: "ETH borrow on Base",
    sub: "Collateral credit",
    amount: "2.14%",
    icon: "token-branded:base",
    iconClassName: "",
  },
];

export default function EarnSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % OPPORTUNITIES.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  const visibleOpportunities = Array.from({ length: 3 }, (_, offset) => {
    const index = (activeIndex + offset) % OPPORTUNITIES.length;
    return OPPORTUNITIES[index];
  });

  return (
    <section
      id="earn"
      className="bg-lavender px-8 pt-10 pb-16 sm:px-10 md:pt-12 md:pb-20 lg:px-8 lg:pt-16 lg:pb-24"
    >
      <div className="mx-auto max-w-[592px] lg:max-w-[1040px] xl:max-w-[1120px]">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-ink lg:text-[12px]">
          What mom3 helps you do
        </p>

        <h2 className="font-display mt-4 text-center text-4xl font-bold uppercase leading-[0.95] tracking-tight text-ink md:text-6xl lg:mt-5 lg:text-7xl">
          <span className="block">Track assets.</span>
          <span className="block">Find yield.</span>
          <span className="block">Rebalance fast.</span>
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:mt-16 lg:gap-5">
          {/* Top wide black card — fixed aspect ratio matches the design */}
          <article className="relative aspect-[1.05/1] overflow-hidden rounded-[32px] bg-ink text-white sm:col-span-2 sm:aspect-[2.1/1] lg:rounded-[40px]">
            {/* Brand mark */}
            <Image
              src="/brand-logo.png"
              alt="mom3"
              width={48}
              height={48}
              className="absolute left-6 top-6 z-10 h-7 w-7 object-contain brightness-0 invert md:left-8 md:top-8 lg:h-9 lg:w-9"
              priority={false}
            />

            {/* Heading — centered vertically, left half on desktop */}
            <div className="absolute inset-y-0 left-0 flex items-center px-6 sm:w-[52%] sm:px-10 lg:px-14 xl:px-16">
              <h3 className="font-display text-2xl font-bold leading-[1.05] tracking-tight text-white/55 sm:text-[34px] lg:text-[44px] xl:text-[50px]">
                Move <span className="text-[#ccff00]">capital</span> with clear
                context
              </h3>
            </div>

            {/* PhoneMock — vertical-centered, bleeds slightly past the card
                bottom and is clipped by the card's overflow-hidden. */}
            <div className="pointer-events-none absolute right-4 top-1/2 [transform:translateY(-22%)] sm:right-9 sm:[transform:translateY(-18%)] lg:right-14 lg:[transform:translateY(-16%)] xl:right-16">
              <PhoneMock
                className="w-[140px] max-w-none sm:w-[210px] lg:w-[300px] xl:w-[330px]"
                label="Send money preview"
              />
            </div>
          </article>

          {/* Bottom-left black card with trip list */}
          <article className="min-h-[280px] rounded-[32px] bg-ink p-6 text-white sm:min-h-[300px] lg:min-h-[380px] lg:rounded-[40px] lg:p-8">
            <p className="text-center text-sm leading-snug text-white/70 sm:px-2 lg:text-base lg:px-4">
              <span className="font-semibold text-white">
                Compare real opportunities.
              </span>{" "}
              See lending, yield, and borrow positions before you take action.
            </p>

            <ul className="mt-5 space-y-2.5 lg:mt-7 lg:space-y-3">
              {visibleOpportunities.map((t, idx) => (
                <li
                  key={`${t.label}-${activeIndex}`}
                  className={`flex items-center justify-between rounded-full px-3 py-2 pr-4 text-ink transition-all duration-700 ease-out lg:px-4 lg:py-2.5 lg:pr-5 ${
                    idx === 0
                      ? "translate-x-0 scale-[1.015] bg-[#ccff00] shadow-[0_12px_26px_-18px_rgba(204,255,0,0.9)]"
                      : "translate-x-0 scale-100 bg-white"
                  }`}
                >
                  <span className="flex items-center gap-3 lg:gap-3.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F1F8] lg:h-8 lg:w-8">
                      <Icon
                        icon={t.icon}
                        aria-hidden="true"
                        width={18}
                        height={18}
                        className={t.iconClassName}
                      />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold lg:text-[15px]">
                        {t.label}
                      </span>
                      <span className="block text-[10px] text-[#6b6680] lg:text-[11px]">
                        {t.sub}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold lg:text-[15px]">
                    {t.amount}
                    <Icon
                      icon="ph:caret-right-bold"
                      aria-hidden="true"
                      width={12}
                      height={12}
                      className="text-[#6b6680]"
                    />
                  </span>
                </li>
              ))}
            </ul>
          </article>

          {/* Bottom-right column: blue + black stacked */}
          <div className="grid min-h-[280px] gap-4 sm:min-h-[300px] sm:grid-rows-[1fr_auto] lg:min-h-[380px] lg:gap-5">
            <article className="flex min-h-[150px] items-center justify-center rounded-[32px] bg-[#2d2eff] p-8 text-center text-white lg:rounded-[40px] lg:p-10">
              <p className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-[32px] xl:text-[36px]">
                Your money,
                <br />
                <span className="text-[#ccff00]">your strategy.</span>
                <br />
                AI guided.
              </p>
            </article>

            <article className="rounded-[32px] bg-ink p-6 text-white lg:rounded-[40px] lg:p-8">
              <p className="text-center text-sm leading-snug lg:text-base">
                <span className="font-semibold">
                  Every action stays non-custodial,
                </span>{" "}
                <span className="text-white/70">
                  with AI health checks before you execute
                </span>
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
