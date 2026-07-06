"use client";

import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import * as React from "react";

import { FloatingMenuButton } from "@/components/ui/menu-button";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { MiniChart, TimeRangeControl, type TimeRange } from "@/components/ui/mini-chart";
import { cn } from "@/lib/utils";

type Tab = "assets" | "positions" | "summary";
type PositionKind = "Yield" | "Lend" | "Borrow";
type Risk = "Low" | "Medium" | "High";

type Asset = {
  symbol: string;
  name: string;
  amount: string;
  value: string;
  chain: string;
  icon: string;
  allocation: string;
  change: string;
  price: string;
  avgCost: string;
  detail: string;
  chartData: Record<TimeRange, number[]>;
};

type Position = {
  asset: string;
  protocol: string;
  balance: string;
  detail: string;
  kind: PositionKind;
  risk: Risk;
  health: number;
  summary: string;
  icon: string;
  protocolIcon: string;
  protocolTone: string;
  action: string;
  exposure: string;
  chartData: Record<TimeRange, number[]>;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "assets", label: "Assets" },
  { id: "positions", label: "Positions" },
  { id: "summary", label: "Summary" },
];

const quickActions = [
  {
    label: "Deposit",
    href: "#",
    icon: "lucide:arrow-down",
    className: "bg-[#241CFF] text-[#ccff00]",
  },
  {
    label: "Convert",
    href: "/convert",
    icon: "lucide:refresh-cw",
    className: "bg-[#242426] text-white",
  },
  {
    label: "Send",
    href: "/send",
    icon: "lucide:arrow-up",
    className: "bg-[#242426] text-white",
  },
];

const chartSeries: Record<string, Record<TimeRange, number[]>> = {
  steady: {
    "1D": [0, 0.1, 0.08, 0.18, 0.22, 0.2, 0.28],
    "1W": [0, 0.4, 0.35, 0.7, 0.92, 1.1, 1.24],
    "1M": [0, 1.2, 1.8, 2.4, 3.1, 3.8, 4.2],
    "1Y": [0, 3.2, 5.6, 8.4, 11.8, 14.6, 18.2],
  },
  volatile: {
    "1D": [0, -0.4, 0.8, 0.2, 1.2, 0.6, 1.7],
    "1W": [0, 2.2, -1.4, 3.8, 2.1, 5.2, 4.4],
    "1M": [0, 4.8, 1.2, 7.2, 9.4, 6.6, 12.8],
    "1Y": [0, 18, -6, 24, 42, 31, 58],
  },
  risk: {
    "1D": [0, -0.8, -0.4, -1.4, -0.9, -1.8, -1.2],
    "1W": [0, -2.2, -1.5, -4.1, -3.4, -5.6, -4.8],
    "1M": [0, -4.8, -2.2, -7.4, -9.8, -6.1, -11.2],
    "1Y": [0, 8, -12, 4, -18, -6, -24],
  },
};

const assets: Asset[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    amount: "1,420.00 USDC",
    value: "$1,420.00",
    chain: "Base",
    icon: "cryptocurrency-color:usdc",
    allocation: "56.8%",
    change: "+0.24%",
    price: "$1.00",
    avgCost: "$1.00",
    detail: "Stablecoin utama untuk deposit, lending, dan pembayaran harian.",
    chartData: chartSeries.steady,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: "0.42 ETH",
    value: "$1,046.80",
    chain: "EVM",
    icon: "cryptocurrency-color:eth",
    allocation: "41.9%",
    change: "+1.72%",
    price: "$2,492.38",
    avgCost: "$2,420.00",
    detail: "Aset volatil untuk collateral dan eksposur pertumbuhan.",
    chartData: chartSeries.volatile,
  },
  {
    symbol: "USDe",
    name: "Ethena USDe",
    amount: "620.00 USDe",
    value: "$620.00",
    chain: "Ethereum",
    icon: "token-branded:ethena",
    allocation: "24.8%",
    change: "+0.41%",
    price: "$1.00",
    avgCost: "$0.99",
    detail: "Stable yield asset dengan risiko protokol yang perlu dipantau.",
    chartData: chartSeries.steady,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    amount: "430.00 USDT",
    value: "$430.00",
    chain: "Morpho",
    icon: "cryptocurrency-color:usdt",
    allocation: "17.2%",
    change: "+0.12%",
    price: "$1.00",
    avgCost: "$1.00",
    detail: "Stablecoin cadangan untuk lending konservatif dan likuiditas.",
    chartData: chartSeries.steady,
  },
  {
    symbol: "PT-sUSDe",
    name: "Pendle Principal Token",
    amount: "210.00 PT",
    value: "$210.00",
    chain: "Pendle",
    icon: "token-branded:pendle",
    allocation: "8.4%",
    change: "-1.12%",
    price: "$1.00",
    avgCost: "$1.04",
    detail: "Yield token dengan sensitivitas terhadap expiry dan likuiditas market.",
    chartData: chartSeries.risk,
  },
  {
    symbol: "ZORB",
    name: "Zora Position",
    amount: "184.20 ZORB",
    value: "$184.20",
    chain: "Zora",
    icon: "simple-icons:zora",
    allocation: "7.4%",
    change: "-4.80%",
    price: "$1.00",
    avgCost: "$1.18",
    detail: "Eksperimen creator yield dengan volatilitas dan likuiditas lebih tinggi.",
    chartData: chartSeries.risk,
  },
];

const positions: Position[] = [
  {
    asset: "USDC",
    protocol: "Aave v3",
    balance: "$1,250.00",
    detail: "5.15% APY",
    kind: "Lend",
    risk: "Low",
    health: 94,
    summary: "Stable USDC supply on Aave with deep liquidity and low volatility.",
    icon: "cryptocurrency-color:usdc",
    protocolIcon: "simple-icons:aave",
    protocolTone: "text-[#B650F2]",
    action: "Keep supplied",
    exposure: "$1,250 stablecoin",
    chartData: chartSeries.steady,
  },
  {
    asset: "ETH",
    protocol: "Aave v3",
    balance: "0.42 ETH",
    detail: "70% borrow power",
    kind: "Borrow",
    risk: "Medium",
    health: 82,
    summary: "ETH collateral position is healthy, but should be watched during volatility.",
    icon: "cryptocurrency-color:eth",
    protocolIcon: "simple-icons:aave",
    protocolTone: "text-[#B650F2]",
    action: "Watch collateral",
    exposure: "0.42 ETH collateral",
    chartData: chartSeries.volatile,
  },
  {
    asset: "USDe",
    protocol: "Ethena",
    balance: "$620.00",
    detail: "8.40% APY",
    kind: "Yield",
    risk: "Medium",
    health: 78,
    summary: "Higher yield stable strategy with additional protocol and market structure risk.",
    icon: "token-branded:ethena",
    protocolIcon: "simple-icons:ethereum",
    protocolTone: "text-[#8EA7FF]",
    action: "Limit size",
    exposure: "$620 synthetic stable",
    chartData: chartSeries.steady,
  },
  {
    asset: "USDT",
    protocol: "Morpho",
    balance: "$430.00",
    detail: "4.88% APY",
    kind: "Lend",
    risk: "Low",
    health: 91,
    summary: "Conservative lending market with strong collateral buffers.",
    icon: "cryptocurrency-color:usdt",
    protocolIcon: "simple-icons:morpho",
    protocolTone: "text-[#2E5BFF]",
    action: "Keep supplied",
    exposure: "$430 stablecoin",
    chartData: chartSeries.steady,
  },
  {
    asset: "USDC",
    protocol: "Uniswap",
    balance: "$360.00",
    detail: "6.44% APY",
    kind: "Yield",
    risk: "Medium",
    health: 74,
    summary: "LP-style yield has fee upside, but can move with pool conditions.",
    icon: "cryptocurrency-color:usdc",
    protocolIcon: "simple-icons:uniswap",
    protocolTone: "text-[#FF007A]",
    action: "Review fees",
    exposure: "$360 LP range",
    chartData: chartSeries.volatile,
  },
  {
    asset: "ZORB",
    protocol: "Zora",
    balance: "$184.20",
    detail: "Creator yield",
    kind: "Yield",
    risk: "High",
    health: 63,
    summary: "Experimental creator yield position with higher variance and lower liquidity.",
    icon: "simple-icons:zora",
    protocolIcon: "simple-icons:zora",
    protocolTone: "text-white",
    action: "Reduce exposure",
    exposure: "$184 creator yield",
    chartData: chartSeries.risk,
  },
];

const kindClassName: Record<PositionKind, string> = {
  Yield: "border-[#ccff00]/25 bg-[#ccff00]/10 text-[#ccff00]",
  Lend: "border-[#3B82F6]/25 bg-[#3B82F6]/10 text-[#75A7FF]",
  Borrow: "border-[#FFB020]/25 bg-[#FFB020]/10 text-[#FFD166]",
};

const riskClassName: Record<Risk, string> = {
  Low: "text-[#ccff00]",
  Medium: "text-[#FFD166]",
  High: "text-[#FF6B6B]",
};

function PositionIcon({ position }: { position: Position }) {
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
      <Icon icon={position.icon} className="h-7 w-7" aria-hidden="true" />
      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#1F1F21] bg-[#111113]">
        <Icon
          icon={position.protocolIcon}
          className={cn("h-3.5 w-3.5", position.protocolTone)}
          aria-hidden="true"
        />
      </span>
    </span>
  );
}

function AssetDetailPanel({
  asset,
  range,
  onRangeChange,
}: {
  asset: Asset;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}) {
  const tone = asset.change.startsWith("-") ? "red" : "green";

  return (
    <section className="rounded-[24px] border border-white/10 bg-[#111217] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
          <Icon icon={asset.icon} className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-white">
                {asset.symbol} Detail
              </h2>
              <p className="mt-1 text-sm font-medium leading-snug text-[#A7A7B7]">
                {asset.detail}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-black",
                tone === "green"
                  ? "bg-[#ccff00]/10 text-[#ccff00]"
                  : "bg-[#FF6B6B]/10 text-[#FF6B6B]",
              )}
            >
              {asset.change}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["Value", asset.value],
          ["Allocation", asset.allocation],
          ["Price", asset.price],
          ["Avg cost", asset.avgCost],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-medium text-[#A7A7B7]">{label}</p>
            <p className="mt-1 text-sm font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <TimeRangeControl value={range} onChange={onRangeChange} />
        <MiniChart
          values={asset.chartData[range]}
          label={`${asset.symbol} performance`}
          tone={tone}
          range={range}
          className="mt-3"
        />
      </div>
    </section>
  );
}

function DetailPanel({
  position,
  range,
  onRangeChange,
}: {
  position: Position;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}) {
  const chartTone =
    position.risk === "High" ? "red" : position.risk === "Medium" ? "yellow" : "green";

  return (
    <section className="rounded-[24px] border border-white/10 bg-[#111217] p-4">
      <div className="flex items-start gap-3">
        <PositionIcon position={position} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-black text-white">
              {position.protocol} Detail
            </h2>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-black",
                kindClassName[position.kind],
              )}
            >
              {position.kind}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium leading-snug text-[#A7A7B7]">
            {position.summary}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <TimeRangeControl value={range} onChange={onRangeChange} />
        <MiniChart
          values={position.chartData[range]}
          label={`${position.protocol} position trend`}
          tone={chartTone}
          range={range}
          className="mt-3"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[18px] border border-white/10">
        <div className="border-r border-white/10 p-3">
          <p className="text-xs font-medium text-[#A7A7B7]">Risk</p>
          <p className={cn("mt-1 text-base font-black", riskClassName[position.risk])}>
            {position.risk}
          </p>
        </div>
        <div className="border-r border-white/10 p-3">
          <p className="text-xs font-medium text-[#A7A7B7]">Health</p>
          <p className="mt-1 text-base font-black text-[#ccff00]">{position.health}</p>
        </div>
        <div className="p-3">
          <p className="text-xs font-medium text-[#A7A7B7]">Return</p>
          <p className="mt-1 text-base font-black text-white">{position.detail}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs font-medium text-[#A7A7B7]">Action</p>
          <p className="mt-1 text-sm font-black text-white">{position.action}</p>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs font-medium text-[#A7A7B7]">Exposure</p>
          <p className="mt-1 text-sm font-black text-white">{position.exposure}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.03] p-3">
        <p className="text-sm font-black text-white">Summary</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-[#A7A7B7]">
          AI score recommends keeping this position active while health stays above
          75. Rebalance if risk increases or expected return drops below the
          portfolio target.
        </p>
      </div>
    </section>
  );
}

const tabVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AssetsView() {
  const [activeTab, setActiveTab] = React.useState<Tab>("assets");
  const [selectedAsset, setSelectedAsset] = React.useState(assets[0]);
  const [selectedPosition, setSelectedPosition] = React.useState(positions[0]);
  const [assetRange, setAssetRange] = React.useState<TimeRange>("1W");
  const [positionRange, setPositionRange] = React.useState<TimeRange>("1W");

  const cta =
    activeTab === "positions"
      ? { label: "View AI Strategy", href: "/ai/strategy", icon: "lucide:arrow-right" }
      : activeTab === "summary"
        ? { label: "Rebalance Portfolio", href: "/ai", icon: "solar:stars-bold" }
        : { label: "Add Assets", href: "#", icon: "lucide:plus" };

  return (
    <MobileShell bottomSlot={<FloatingMenuButton />}>
        <MobilePageHeader title="My Assets" backHref="/dashboard" backLabel="Back to dashboard" />

        <section className="mt-6 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,51,189,0.34),rgba(17,18,23,1)_58%)] p-4 text-center">
          <p className="text-xs font-black uppercase tracking-normal text-[#8F8F96]">
            Portfolio value
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-white">
            <span className="align-top text-xl">$</span>2,500.00
          </p>
          <p className="mx-auto mt-2 max-w-[280px] text-sm font-medium leading-snug text-[#A7A7B7]">
            Stablecoin-heavy allocation keeps your wallet healthy while AI watches
            risk, yield, and borrow usage.
          </p>
          <div className="relative mx-auto mt-4 flex h-36 w-56 items-end justify-center">
            <svg viewBox="0 0 200 140" className="h-36 w-56">
              <defs>
                <linearGradient id="gauge-red" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF4444" />
                  <stop offset="100%" stopColor="#FF6B35" />
                </linearGradient>
                <linearGradient id="gauge-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFB020" />
                  <stop offset="100%" stopColor="#FFD166" />
                </linearGradient>
                <linearGradient id="gauge-green" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#86EF5C" />
                  <stop offset="100%" stopColor="#ccff00" />
                </linearGradient>
              </defs>

              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1C1C1E" strokeWidth="14" strokeLinecap="round" />

              <path d="M 20 100 A 80 80 0 0 1 75.3 23.9" fill="none" stroke="url(#gauge-red)" strokeWidth="14" strokeLinecap="round" />

              <path d="M 75.3 23.9 A 80 80 0 0 1 147 35.3" fill="none" stroke="url(#gauge-yellow)" strokeWidth="14" strokeLinecap="round" />

              <path d="M 147 35.3 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gauge-green)" strokeWidth="14" strokeLinecap="round" />

              <line
                x1="100"
                y1="100"
                x2={100 + 65 * Math.cos(((180 - 86 * 1.8) * Math.PI) / 180)}
                y2={100 - 65 * Math.sin(((180 - 86 * 1.8) * Math.PI) / 180)}
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="5" fill="white" />

              <text x="100" y="126" textAnchor="middle" className="fill-white text-[22px] font-black">86</text>
              <text x="100" y="139" textAnchor="middle" className="fill-[#8F8F96] text-[13px] font-semibold">/ 100 health</text>
            </svg>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-[18px] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full",
                  action.className,
                )}
              >
                <Icon icon={action.icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-white">{action.label}</span>
            </Link>
          ))}
        </section>

        <div className="mt-5 grid grid-cols-3 rounded-full bg-[#1C1C1E] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-9 rounded-full text-sm font-black transition-colors focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
                activeTab === tab.id
                  ? "bg-white text-black"
                  : "text-[#9A9AA2] hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "assets" ? (
            <motion.section
              key="assets"
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="mt-4 space-y-4"
            >
              <div className="overflow-hidden rounded-[24px] bg-[#1F1F21]">
                {assets.map((asset, index) => (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/assets/${slugify(asset.symbol)}`}
                      className="flex min-h-[76px] w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                        <Icon icon={asset.icon} className="h-7 w-7" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-bold text-white">
                          {asset.name}
                        </span>
                        <span className="mt-1 block text-sm font-medium text-[#8E8E93]">
                          {asset.amount} on {asset.chain}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-bold text-white">{asset.value}</span>
                        <span
                          className={cn(
                            "mt-1 block text-xs font-black",
                            asset.change.startsWith("-") ? "text-[#FF6B6B]" : "text-[#ccff00]",
                          )}
                        >
                          {asset.change}
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : null}

          {activeTab === "positions" ? (
            <motion.section
              key="positions"
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="mt-4 space-y-4"
            >
              <div className="overflow-hidden rounded-[24px] bg-[#1F1F21]">
                {positions.map((position, index) => (
                  <motion.div
                    key={`${position.asset}-${position.protocol}-${position.kind}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/assets/positions/${slugify(`${position.asset}-${position.protocol}-${position.kind}`)}`}
                      className="flex min-h-[80px] w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
                    >
                      <PositionIcon position={position} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-base font-black text-white">
                            {position.asset}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-black",
                              kindClassName[position.kind],
                            )}
                          >
                            {position.kind}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-sm font-semibold text-[#8F8F96]">
                          {position.protocol}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-base font-black text-white">
                          {position.balance}
                        </span>
                        <span className={cn("mt-1 block text-xs font-bold", riskClassName[position.risk])}>
                          {position.risk} risk
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : null}

          {activeTab === "summary" ? (
            <motion.section
              key="summary"
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="mt-4 space-y-3"
            >
              <div className="rounded-[22px] border border-white/10 bg-[#111217] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#A7A7B7]">Portfolio Health</p>
                    <p className="mt-1 text-2xl font-black text-[#ccff00]">86</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ccff00]/10 text-[#ccff00]">
                    <Icon icon="solar:shield-check-bold" className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium leading-relaxed text-[#A7A7B7]">
                  Portfolio is healthy with stablecoin-heavy exposure. AI suggests reducing
                  experimental yield and moving part of it into Aave or Morpho lending.
                </p>
              </div>

              <div>
                <TimeRangeControl value={positionRange} onChange={setPositionRange} />
                <MiniChart
                  values={selectedPosition.chartData[positionRange]}
                  label="Portfolio trend"
                  tone="green"
                  range={positionRange}
                  compact
                  className="mt-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ["Net APY", "5.92%", "After fees"],
                  ["Risk Level", "Low", "Stable weighted"],
                  ["Borrow Usage", "28%", "Safe range"],
                  ["Rebalance", "7 days", "Auto check"],
                ].map(([label, value, helper]) => (
                  <div key={label} className="rounded-[18px] border border-white/10 bg-[#111217] p-2.5">
                    <p className="text-xs font-medium text-[#A7A7B7]">{label}</p>
                    <p className="mt-1.5 text-lg font-black text-white">{value}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#8F8F96]">{helper}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <Link
          href={cta.href}
          className="mt-5 flex h-14 items-center justify-center rounded-full bg-[#ccff00] px-5 text-base font-black text-[#3B33BD] transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#ccff00]/70"
        >
          {cta.label}
          <Icon icon={cta.icon} className="ml-2 h-5 w-5" aria-hidden="true" />
        </Link>
    </MobileShell>
  );
}
