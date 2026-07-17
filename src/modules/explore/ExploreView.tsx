"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import * as React from "react";
import { CoinIcon, DefiIcon, DexIcon } from "react-web3-icons/dynamic";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MobileBottomBar, MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { cn } from "@/lib/utils";
import { ExploreFeatureCardsSkeleton, ExploreMarketSectionsSkeleton } from "@/modules/explore/components/ExploreSkeleton";
import { useExploreYields, type ExploreYieldPool } from "@/modules/explore/hooks/useExploreYields";

type MarketItem = ExploreYieldPool;
type ChainFilter = "All" | number;

const DEFI_PROTOCOL_SLUGS = [
  "aave", "balancer", "compound", "convex", "eigenlayer", "ethena", "etherfi",
  "frax", "gmx", "lido", "liquity", "makerdao", "morpho", "pendle",
  "rocketpool", "spark", "synthetix", "venus", "yearn",
] as const;

const DEX_PROTOCOL_SLUGS = [
  "aerodrome", "camelot", "curve", "dydx", "pancakeswap", "sushiswap",
  "uniswap", "velodrome",
] as const;

const TOKEN_NAMES: Record<string, string> = {
  ARB: "Arbitrum",
  BTC: "Bitcoin",
  DAI: "Dai",
  ETH: "Ethereum",
  USDC: "USD Coin",
  USDT: "Tether USD",
  WBTC: "Wrapped Bitcoin",
  WETH: "Wrapped Ether",
};

const TOKEN_SYMBOLS = Object.keys(TOKEN_NAMES).sort((left, right) => right.length - left.length);

function assetTokens(asset: string) {
  const normalized = asset.toUpperCase();
  const parts = normalized.split(/[-/+:_\s]+/).map((part) => part.replace(/\.E$/, ""));
  const matched = parts.flatMap((part) => {
    const exact = TOKEN_SYMBOLS.find((symbol) => part === symbol);
    if (exact) return [exact];
    const embedded = TOKEN_SYMBOLS.find((symbol) => part.endsWith(symbol));
    return embedded ? [embedded] : [];
  });
  return [...new Set(matched)].slice(0, 2);
}

function coinIconSymbol(symbol: string) {
  if (symbol === "WETH") return "ETH";
  if (symbol === "WBTC") return "BTC";
  return symbol;
}

function AssetLogo({ asset }: { asset: string }) {
  const tokens = assetTokens(asset);
  if (!tokens.length) {
    return <span className="text-sm font-black uppercase text-white">{asset.slice(0, 2)}</span>;
  }

  return (
    <span className="flex items-center">
      {tokens.map((symbol, index) => (
        <span key={symbol} className={cn("relative flex items-center", index > 0 && "-ml-2")} style={{ zIndex: tokens.length - index }}>
          <CoinIcon
            symbol={coinIconSymbol(symbol)}
            variant="colored"
            size={tokens.length > 1 ? 28 : 36}
            fallback={<span className="text-xs font-black text-white">{symbol.slice(0, 1)}</span>}
          />
        </span>
      ))}
    </span>
  );
}

function assetLabel(asset: string) {
  const tokens = assetTokens(asset);
  if (tokens.length === 1) return { name: TOKEN_NAMES[tokens[0]], symbol: tokens[0] };
  if (tokens.length > 1) return { name: tokens.join(" / "), symbol: "" };
  return { name: asset, symbol: "" };
}

function ProtocolLogo({ protocol }: { protocol: string }) {
  const normalized = protocol.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const fallback = (
    <span className="text-[9px] font-black uppercase leading-none text-white">
      {protocol.slice(0, 1)}
    </span>
  );
  const defiSlug = DEFI_PROTOCOL_SLUGS.find((slug) => normalized.includes(slug));
  if (defiSlug) return <DefiIcon name={defiSlug} variant="colored" size={14} fallback={fallback} />;
  const dexSlug = DEX_PROTOCOL_SLUGS.find((slug) => normalized.includes(slug));
  if (dexSlug) return <DexIcon name={dexSlug} variant="colored" size={14} fallback={fallback} />;
  return fallback;
}

const chainFilters: Array<{
  id: ChainFilter;
  label: string;
  logo: string;
}> = [
  { id: "All", label: "All chains", logo: "solar:global-bold" },
  { id: 42161, label: "Arbitrum", logo: "token-branded:arbitrum" },
  { id: 8453, label: "Base", logo: "token-branded:base" },
  { id: 101, label: "Solana", logo: "token-branded:solana" },
  { id: 1, label: "Ethereum", logo: "cryptocurrency-color:eth" },
  { id: 56, label: "BNB Chain", logo: "cryptocurrency-color:bnb" },
  { id: 196, label: "XLayer", logo: "solar:layers-bold" },
  { id: 10, label: "Optimism", logo: "token-branded:optimism" },
  { id: 137, label: "Polygon", logo: "token-branded:polygon" },
  { id: 143, label: "Monad", logo: "solar:global-bold" },
  { id: 146, label: "Sonic", logo: "solar:global-bold" },
  { id: 169, label: "Manta", logo: "solar:global-bold" },
  { id: 500, label: "Mantle", logo: "solar:global-bold" },
  { id: 999, label: "HyperEVM", logo: "solar:global-bold" },
  { id: 1030, label: "Conflux", logo: "solar:global-bold" },
  { id: 4200, label: "Merlin", logo: "solar:global-bold" },
  { id: 5000, label: "Mantle", logo: "solar:global-bold" },
  { id: 9745, label: "Plasma", logo: "solar:global-bold" },
  { id: 34443, label: "Mode", logo: "solar:global-bold" },
  { id: 43114, label: "Avalanche", logo: "token-branded:avalanche" },
  { id: 59144, label: "Linea", logo: "solar:global-bold" },
  { id: 80094, label: "Berachain", logo: "solar:global-bold" },
  { id: 81457, label: "Blast", logo: "solar:global-bold" },
];

const marketCategoryStyles: Record<
  MarketItem["category"],
  { container: string; row: string; sectionIcon: string }
> = {
  Yield: {
    container: "bg-[#1C1C1E]",
    row: "hover:bg-[#202024] focus-visible:ring-[#ccff00]/70",
    sectionIcon: "text-[#ccff00]",
  },
  Risk: {
    container: "bg-[#1C1C1E]",
    row: "hover:bg-[#202024] focus-visible:ring-[#ccff00]/70",
    sectionIcon: "text-[#ccff00]",
  },
};

const EXPLORE_PROTOCOLS = [
  { id: "all", name: "All protocols" },
  { id: "aave-v3", name: "Aave V3" },
  { id: "compound-v3", name: "Compound V3" },
  { id: "morpho-blue", name: "Morpho" },
  { id: "kamino-lend", name: "Kamino" },
] as const;

function matchesMarket(item: MarketItem, query: string) {
  const normalized = query.toLowerCase();
  return (
    item.asset.toLowerCase().includes(normalized) ||
    item.protocol.toLowerCase().includes(normalized) ||
    item.primary.toLowerCase().includes(normalized) ||
    item.chain.toLowerCase().includes(normalized)
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function marketDetailHref(item: MarketItem) {
  const params = new URLSearchParams({
    asset: item.asset,
    protocol: item.protocol,
    chain: item.chain,
    chainId: String(item.chainId),
    apy: String(item.apy),
    tvl: item.tvl,
    utilization: item.utilization,
    risk: item.risk,
    category: item.category,
    description: item.description,
    icon: item.icon,
    color: item.color,
    change1d: String(item.apyChange1d ?? 0),
    change7d: String(item.apyChange7d ?? 0),
    change30d: String(item.apyChange30d ?? 0),
  });
  if (item.marketId) params.set("marketId", item.marketId);
  return `/explore/${slugify(item.id)}?${params.toString()}`;
}

function MarketList({
  title,
  items,
  onShowMore,
  isLoadingMore,
}: {
  title: string;
  items: MarketItem[];
  onShowMore?: () => void;
  isLoadingMore?: boolean;
}) {
  const pageSize = 5;
  const [visibleCount, setVisibleCount] = React.useState(pageSize);
  const category = items[0]?.category ?? "Yield";
  const styles = marketCategoryStyles[category];
  const visibleItems = items.slice(0, visibleCount);
  React.useEffect(() => setVisibleCount(pageSize), [items]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div className="flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-1 text-base font-semibold text-white">
          {items[0] ? (
            <Link href={marketDetailHref(items[0])} className="flex min-h-10 items-center gap-1 rounded-md focus-visible:ring-2 focus-visible:ring-[#ccff00]">
              {title}
              <AppIcon icon="lucide:chevron-right" aria-hidden="true" width={17} height={17} className={styles.sectionIcon} />
            </Link>
          ) : title}
        </h2>
        <span className="rounded-full bg-[#1C1C1E] px-2.5 py-1 text-xs font-bold text-[#A7A7B7]">
          {items.length} market{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className={cn("mt-3 overflow-hidden rounded-[28px] p-3", styles.container)}>
        {visibleItems.map((item, index) => {
          const asset = assetLabel(item.asset);
          return (
          <motion.div
            key={`${title}-${item.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={marketDetailHref(item)}
              className={cn(
                "flex min-h-[68px] w-full items-center gap-3 rounded-[20px] px-2 text-left transition-colors focus-visible:ring-2",
                styles.row,
              )}
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden="true">
                <AssetLogo asset={item.asset} />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#111217]">
                  <ProtocolLogo protocol={item.protocol} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-base font-bold text-white">{asset.name}</span>
                  {asset.symbol ? <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-black text-[#C8C8CE]">{asset.symbol}</span> : null}
                </span>
                <span className="mt-0.5 block truncate text-sm font-medium text-[#8E8E93]">
                  {item.protocol} · {item.chain}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold text-white">{item.primary}</span>
                <span className={`mt-0.5 block text-xs font-black ${item.positive ? "text-[#ccff00]" : "text-[#A7A7A7]"}`}>
                  {item.secondary}
                </span>
              </span>
            </Link>
          </motion.div>
          );
        })}
        {visibleCount < items.length || onShowMore ? (
          <div className="mt-2 flex justify-center border-t border-white/[0.06] px-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (visibleCount < items.length) setVisibleCount((current) => Math.min(items.length, current + pageSize));
                else onShowMore?.();
              }}
              disabled={isLoadingMore}
              className="min-h-10 rounded-full px-4 text-xs font-bold text-[#ccff00] transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#ccff00]"
            >
              {isLoadingMore ? "Loading…" : `Show more${items.length > visibleCount ? ` (${items.length - visibleCount} remaining)` : ""}`}
            </button>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

export default function ExploreView() {
  const [query, setQuery] = React.useState("");
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [chainFilter, setChainFilter] = React.useState<ChainFilter>("All");
  const [selectedProtocol, setSelectedProtocol] = React.useState<string>("all");
  const { yieldPools, riskPools, isLoading, error, hasMoreByProtocol, loadingMoreProtocol, loadMoreProtocol } = useExploreYields(selectedProtocol);

  const filteredYield = React.useMemo(
    () => (query.trim() ? yieldPools.filter((item) => matchesMarket(item, query)) : yieldPools).filter((item) => chainFilter === "All" || item.chainId === chainFilter),
    [yieldPools, query, chainFilter],
  );
  const filteredRisk = React.useMemo(
    () => (query.trim() ? riskPools.filter((item) => matchesMarket(item, query)) : riskPools).filter((item) => chainFilter === "All" || item.chainId === chainFilter),
    [riskPools, query, chainFilter],
  );
  const top10YieldMarkets = React.useMemo(
    () => [...filteredYield]
      .sort((left, right) =>
        (right.opportunityScore ?? right.apy) - (left.opportunityScore ?? left.apy),
      )
      .slice(0, 10),
    [filteredYield],
  );

  const protocolGroups = React.useMemo(() => {
    const groups = new Map<string, MarketItem[]>();

    [...filteredYield, ...filteredRisk].forEach((market) => {
      const protocol = market.protocol.trim() || "Other";
      const existing = groups.get(protocol) ?? [];
      existing.push(market);
      groups.set(protocol, existing);
    });

    const priority = ["aave", "morpho", "compound"];
    return Array.from(groups.entries())
      .map(([protocol, items]) => ({
        protocol,
        items: [...items].sort((left, right) => right.apy - left.apy),
      }))
      .sort((left, right) => {
        const leftIndex = priority.findIndex((name) => left.protocol.toLowerCase().includes(name));
        const rightIndex = priority.findIndex((name) => right.protocol.toLowerCase().includes(name));
        if (leftIndex >= 0 || rightIndex >= 0) {
          return (leftIndex < 0 ? priority.length : leftIndex) - (rightIndex < 0 ? priority.length : rightIndex);
        }
        return left.protocol.localeCompare(right.protocol);
      });
  }, [filteredRisk, filteredYield]);

  const hasResults = filteredYield.length > 0 || filteredRisk.length > 0;
  const selectedChainLabel = chainFilters.find((item) => item.id === chainFilter)?.label ?? "All chains";
  const headerAction = (
    <Button
      type="button"
      onClick={() => setFilterSheetOpen(true)}
      color="dark"
      size="icon"
      rounded="full"
      startIcon="lucide:sliders-horizontal"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
      aria-label="Open explore filters"
      aria-expanded={filterSheetOpen}
      aria-haspopup="dialog"
    />
  );

  return (
    <MobileShell
      bottomSlot={
        <MobileBottomBar>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <label htmlFor="explore-search" className="sr-only">
              Search yield opportunities
            </label>
            <div className="flex h-14 w-full items-center gap-3 rounded-full bg-[#1C1C1E]/90 px-5 shadow-[0_16px_34px_-18px_rgba(0,0,0,0.95)] backdrop-blur-md">
              <AppIcon icon="icon-park-outline:search" aria-hidden="true" width={24} height={24} className="text-[#85858d]" />
              <input
                id="explore-search"
                type="search"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search yield opportunities"
                className="min-w-0 flex-1 bg-transparent text-base font-bold text-white placeholder:text-[#9A9AA2] focus:outline-none"
              />
            </div>
          </motion.div>
        </MobileBottomBar>
      }
    >
         <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
           <MobilePageHeader title="Explore" backHref="/dashboard" backLabel="Back to dashboard" action={headerAction} />
         </motion.div>

         <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 overflow-hidden"
        >
          {isLoading ? <ExploreFeatureCardsSkeleton /> : <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
            {top10YieldMarkets.map((market, index) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[82%] snap-start"
              >
                <Link
                  href={marketDetailHref(market)}
                  aria-label={`Open yield market ${market.asset} on ${market.protocol}`}
                  className="block min-h-[188px] rounded-[24px] bg-[#1C1C1E] p-4 transition-colors hover:bg-[#252529] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A2A3E]"><AssetLogo asset={market.asset} /></span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3E] text-[#ccff00]"><AppIcon icon="lucide:arrow-right" aria-hidden="true" width={22} height={22} /></span>
                  </div>
                  <div className="mt-5 flex items-center gap-2"><h2 className="text-base font-bold text-white">Top 10 Yield Market</h2><span className="rounded-full bg-[#ccff00]/10 px-2 py-0.5 text-[10px] font-black text-[#ccff00]">#{index + 1}</span></div>
                  <div className="mt-2 flex min-w-0 items-center gap-2"><p className="truncate text-sm font-bold text-white">{market.asset}</p><span className="shrink-0 text-xs font-semibold text-[#8E8E93]">{market.protocol}</span></div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#8E8E93]"><ProtocolLogo protocol={market.protocol} /><span className="truncate">{market.chain}</span><span className="ml-auto font-black text-[#ccff00]">{market.apy.toFixed(2)}% APY</span></div>
                </Link>
              </motion.div>
            ))}
          </div>}
          {!isLoading && top10YieldMarkets.length > 1 ? <p className="text-center text-[10px] font-bold text-[#8E8E93]">Swipe to see all {top10YieldMarkets.length} yield markets</p> : null}
        </motion.section>

        <section className="mt-4" aria-label="Protocols">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-white">Protocols</h2>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {EXPLORE_PROTOCOLS.map((protocol) => {
              const active = selectedProtocol === protocol.id;
              return (
                <button
                  key={protocol.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedProtocol(protocol.id)}
                  className={cn("flex min-h-12 shrink-0 items-center gap-2 rounded-2xl border px-3 transition-colors focus-visible:ring-2 focus-visible:ring-[#ccff00]", active ? "border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]" : "border-white/10 bg-[#1C1C1E] text-white hover:bg-[#252529]")}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2A2A3E]"><ProtocolLogo protocol={protocol.name} /></span>
                  <span className="text-xs font-black">{protocol.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {isLoading ? (
          <>
            <ExploreMarketSectionsSkeleton />
            <div className="hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center rounded-[28px] bg-[#151714] px-6 py-12 text-center"
          >
            <AppIcon icon="lucide:loader-circle" aria-hidden="true" width={36} height={36} className="animate-spin text-[#9A9AA2]" />
            <p className="mt-4 text-base font-bold text-white">Loading live yields</p>
            <p className="mt-1 text-sm font-medium text-[#9A9AA2]">Loading live yield markets across Particle-supported chains…</p>
          </motion.div>
            </div>
          </>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center rounded-[28px] bg-[#151714] px-6 py-12 text-center"
          >
            <AppIcon icon="solar:danger-triangle-bold" aria-hidden="true" width={36} height={36} className="text-[#FF7B7B]" />
            <p className="mt-4 text-base font-bold text-white">Yields unavailable</p>
            <p className="mt-1 text-sm font-medium text-[#9A9AA2]">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-5 min-h-10 rounded-full bg-[#ccff00] px-5 text-sm font-black text-black focus-visible:ring-2 focus-visible:ring-[#ccff00]">Retry</button>
          </motion.div>
        ) : hasResults ? (
          <>
            {protocolGroups.map((group) => (
              <MarketList
                key={group.protocol}
                title={group.protocol}
                items={group.items}
                onShowMore={group.items[0]?.protocolId && hasMoreByProtocol[group.items[0].protocolId] ? () => loadMoreProtocol(group.items[0].protocolId!) : undefined}
                isLoadingMore={group.items[0]?.protocolId === loadingMoreProtocol}
              />
            ))}
            {filteredRisk.length > 0 ? <MarketList title="Risk watch" items={filteredRisk} /> : null}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center rounded-[28px] bg-[#151714] px-6 py-12 text-center"
          >
            <AppIcon icon="icon-park-outline:search" aria-hidden="true" width={40} height={40} className="text-[#9A9AA2]" />
            <p className="mt-4 text-base font-bold text-white">No markets found</p>
            <p className="mt-1 text-sm font-medium text-[#9A9AA2]">Try searching by asset, protocol, or chain.</p>
          </motion.div>
        )}

        <BottomSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          title="Filter"
          description="Pilih chain market yang ingin kamu lihat."
          closeLabel="Close explore filters"
          contentClassName="space-y-2"
        >
          {chainFilters.map((filter) => {
            const isActive = filter.id === chainFilter;
            return (
              <Button
                key={filter.id}
                type="button"
                onClick={() => {
                  setChainFilter(filter.id);
                  setFilterSheetOpen(false);
                }}
                variant="plain"
                size="lg"
                rounded="lg"
                label={filter.label}
                className={cn(
                  "flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl px-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
                  isActive ? "bg-[#3B33BD] text-[#ccff00]" : "bg-black/25 text-white hover:bg-white/[0.04]",
                )}
              >
                <span className="min-w-0 flex items-center gap-3">
                  <AppIcon icon={filter.logo} aria-hidden="true" width={19} height={19} className="shrink-0" />
                  <span className="truncate text-sm font-bold">{filter.label}</span>
                </span>
                {isActive ? (
                  <AppIcon icon="material-symbols:check-rounded" aria-hidden="true" width={20} height={20} className="shrink-0" />
                ) : null}
              </Button>
            );
          })}
          <p className="pt-2 text-center text-xs font-bold text-[#8E8E93]">Active: {selectedChainLabel}</p>
        </BottomSheet>
    </MobileShell>
  );
}
