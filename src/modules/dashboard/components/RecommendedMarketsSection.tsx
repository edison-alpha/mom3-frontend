import Image from "next/image";
import Link from "next/link";
import { CoinIcon, DefiIcon, DexIcon } from "react-web3-icons/dynamic";

import { AppIcon } from "@/components/ui/app-icon";
import { formatUsdValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePortfolioViewModel } from "@/modules/assets/hooks/usePortfolioViewModel";
import type { PortfolioPosition } from "@/modules/assets/types/portfolio.types";

const CARD_CLASS = "group min-w-[82%] min-h-[188px] snap-start rounded-[24px] border border-white/[0.12] p-3 transition-[transform,background-color,border-color] duration-150 focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:hover:-translate-y-0.5 sm:min-w-[320px]";

const CHAIN_ICONS: Record<number, string> = {
  1: "cryptocurrency-color:eth",
  10: "token-branded:optimism",
  56: "cryptocurrency-color:bnb",
  101: "token-branded:solana",
  137: "token-branded:polygon",
  43114: "token-branded:avalanche",
  8453: "token-branded:base",
  42161: "token-branded:arbitrum",
};

const DEFI_PROTOCOL_SLUGS = [
  "aave", "balancer", "compound", "convex", "eigenlayer", "ethena", "etherfi",
  "frax", "gmx", "lido", "liquity", "makerdao", "morpho", "pendle",
  "rocketpool", "spark", "synthetix", "venus", "yearn", "jupiter", "kamino",
] as const;
const DEX_PROTOCOL_SLUGS = ["aerodrome", "camelot", "curve", "dydx", "pancakeswap", "sushiswap", "uniswap", "velodrome", "raydium"] as const;
const TOKEN_SYMBOLS = ["USDC", "USDT", "USDE", "USDS", "WETH", "WBTC", "ETH", "BTC", "SOL", "DAI", "BNB", "ARB", "OP", "AVAX", "MATIC"];

function assetTokens(asset: string) {
  const parts = asset.toUpperCase().split(/[-/+:_\s]+/).map((part) => part.replace(/\.E$/, ""));
  return [...new Set(parts.flatMap((part) => {
    const exact = TOKEN_SYMBOLS.find((symbol) => part === symbol);
    if (exact) return [exact];
    const embedded = TOKEN_SYMBOLS.find((symbol) => part.endsWith(symbol));
    return embedded ? [embedded] : [];
  }))].slice(0, 2);
}

function AssetLogo({ asset, compact = false }: { asset: string; compact?: boolean }) {
  const tokens = assetTokens(asset);
  if (!tokens.length) return <span className="text-xs font-black uppercase text-white">{asset.slice(0, 2)}</span>;

  const size = compact ? 34 : 40;
  return (
    <span className="flex items-center" aria-hidden="true">
      {tokens.map((symbol, index) => (
        <span key={symbol} className={cn("relative flex items-center", index > 0 && "-ml-2")} style={{ zIndex: tokens.length - index }}>
          <CoinIcon
            symbol={symbol === "WETH" ? "ETH" : symbol === "WBTC" ? "BTC" : symbol}
            variant="colored"
            size={tokens.length > 1 ? size - 5 : size}
            fallback={<span className="text-xs font-black text-white">{symbol.slice(0, 1)}</span>}
          />
        </span>
      ))}
    </span>
  );
}

function ProtocolLogo({ protocol }: { protocol: string }) {
  const normalized = protocol.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const fallback = <span className="text-[10px] font-black uppercase text-white">{protocol.slice(0, 1)}</span>;

  if (normalized.includes("jupiter")) return <img src="/jupiter-ag-jup-logo.svg" alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" />;
  if (normalized.includes("kamino")) return <img src="/idLn9W035H_logos.png" alt="" width={26} height={26} className="h-[26px] w-[26px] rounded-full object-contain" />;

  const defiSlug = DEFI_PROTOCOL_SLUGS.find((slug) => normalized.includes(slug));
  if (defiSlug) return <DefiIcon name={defiSlug} variant="colored" size={22} fallback={fallback} />;
  const dexSlug = DEX_PROTOCOL_SLUGS.find((slug) => normalized.includes(slug));
  if (dexSlug) return <DexIcon name={dexSlug} variant="colored" size={22} fallback={fallback} />;
  return fallback;
}

function ChainLogo({ chainId, chain }: Pick<PortfolioPosition, "chainId" | "chain">) {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/25" title={chain} aria-hidden="true"><NetworkMark chainId={chainId} size={22} /></span>;
}

function NetworkMark({ chainId, size }: { chainId: number; size: number }) {
  if (chainId === 8453) {
    return <span className="relative block shrink-0 overflow-hidden rounded-full bg-[#1010ff]" style={{ width: size, height: size }}><Image src="/idECUXGIk-_logos.jpeg" alt="" fill sizes={`${size}px`} className="scale-[1.68] object-cover" /></span>;
  }

  return <AppIcon icon={CHAIN_ICONS[chainId] ?? "solar:global-bold"} width={size} height={size} />;
}

function riskClass(risk: PortfolioPosition["risk"]) {
  if (risk === "High") return "border-[#FF7B7B]/30 bg-[#FF7B7B]/10 text-[#FF9A9A]";
  if (risk === "Medium") return "border-[#A98BFF]/30 bg-[#A98BFF]/10 text-[#C5B4FF]";
  return "border-[#ccff00]/25 bg-[#ccff00]/10 text-[#ccff00]";
}

function positionDetailHref(position: PortfolioPosition) {
  const params = new URLSearchParams({
    asset: position.asset,
    protocol: position.protocol,
    chain: position.chain,
    chainId: String(position.chainId),
    apy: String(position.apy),
    risk: position.risk,
    icon: position.icon,
    color: "bg-[#2A2A3E]",
  });
  params.set("marketId", position.marketId);
  const slug = position.marketId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/explore/${slug}?${params.toString()}`;
}

function UserPositionCard({ position }: { position: PortfolioPosition }) {
  const protocol = position.project || position.protocol;

  return (
    <Link
      href={positionDetailHref(position)}
      aria-label={`Open your ${position.asset} position on ${position.protocol} and ${position.chain}`}
      className={cn(CARD_CLASS, "border-white/[0.12] bg-[radial-gradient(circle_at_92%_0%,rgba(59,51,189,0.18),rgba(23,24,29,1)_52%)] hover:border-[#ccff00]/35 hover:bg-[#1d1e23]")}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-white/[0.06] px-2 text-[11px] font-bold text-white"><AppIcon icon="solar:wallet-bold" aria-hidden="true" width={13} height={13} className="text-[#ccff00]" />Your position</span>
        <span className="text-right"><span className="block font-mono text-xl font-black leading-none tabular-nums text-white">{formatUsdValue(position.amountInUSD)}</span><span className="block text-[9px] font-black uppercase tracking-[0.1em] text-[#ccff00]">VALUE</span></span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#2A2A3E]"><AssetLogo asset={position.asset} compact /></span><div className="min-w-0"><h3 className="truncate text-xl font-black leading-none text-white">{position.asset}</h3><p className="mt-1 truncate text-xs font-medium text-[#A7A7B7]">{position.protocol} · {position.chain}</p></div></div>
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25"><ProtocolLogo protocol={protocol} /></span><ChainLogo chainId={position.chainId} chain={position.chain} /></div>
      </div>
      <p className="mt-2.5 flex items-center gap-1 text-xs font-bold text-[#ccff00]"><span className="h-1.5 w-1.5 rounded-full bg-[#53F47C]" aria-hidden="true" />Earning live</p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-2.5"><div className="flex min-w-0 items-center gap-1.5"><span className={cn("inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border px-2 text-[10px] font-black", riskClass(position.risk))}><AppIcon icon="solar:shield-check-bold" aria-hidden="true" width={13} height={13} />{position.risk.toUpperCase()} RISK</span><span className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2 text-[10px] font-black text-[#53F47C]"><span className="h-1.5 w-1.5 rounded-full bg-[#53F47C]" aria-hidden="true" />ACTIVE</span></div><span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-[#A7A7B7]"><span className="text-right"><span className="block">Current APY</span><span className="block font-mono text-sm font-black leading-none tabular-nums text-[#ccff00]">{position.apy.toFixed(2)}%</span></span><span className="h-5 w-px bg-white/20" aria-hidden="true" /><span className="text-sm font-black tracking-tight text-[#AAA6DA]">mom3</span></span></div>
    </Link>
  );
}

function PositionSkeleton() {
  return <div className="min-h-[188px] min-w-[82%] snap-start rounded-[24px] border border-white/[0.07] bg-[#17181d] p-3 sm:min-w-[320px]" aria-hidden="true"><div className="flex justify-between"><span className="h-7 w-24 animate-pulse rounded-full bg-white/[0.08]" /><span className="h-7 w-16 animate-pulse rounded bg-white/[0.08]" /></div><div className="mt-3 flex items-center gap-2.5"><span className="h-11 w-11 animate-pulse rounded-xl bg-white/[0.08]" /><span className="h-6 w-24 animate-pulse rounded bg-white/[0.08]" /></div><span className="mt-4 block h-8 w-36 animate-pulse rounded-full bg-white/[0.08]" /></div>;
}

export function YourPositionsSection() {
  const { positions, isPortfolioLoading, analysisError, refreshPortfolio } = usePortfolioViewModel();
  const activePositions = [...positions]
    .filter((position) => position.amountInUSD > 0)
    .sort((left, right) => right.amountInUSD - left.amountInUSD);

  if (isPortfolioLoading) {
    return (
      <section className="mt-6" aria-labelledby="your-positions-title">
        <h2 id="your-positions-title" className="text-base font-semibold text-white">Your positions</h2>
        <p className="mt-1 text-xs font-medium text-[#A7A7B7]">Checking your live yield positions.</p>
        <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2" role="status" aria-label="Loading your positions">
          <PositionSkeleton />
          <span className="sr-only">Loading your positions</span>
        </div>
      </section>
    );
  }

  if (activePositions.length) {
    return (
      <section className="mt-6" aria-labelledby="your-positions-title">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="your-positions-title" className="text-base font-semibold text-white">Your positions</h2>
            <p className="mt-1 text-xs font-medium text-[#A7A7B7]">Live yield positions you already own.</p>
          </div>
          <Link href="/assets" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-[#ccff00] transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            View assets
            <AppIcon icon="lucide:arrow-up-right" aria-hidden="true" width={15} height={15} />
          </Link>
        </div>
        <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {activePositions.map((position) => <UserPositionCard key={position.id} position={position} />)}
        </div>
      </section>
    );
  }

  if (analysisError) {
    return (
      <section className="mt-6" aria-labelledby="your-positions-title">
        <h2 id="your-positions-title" className="text-base font-semibold text-white">Your positions</h2>
        <div className="mt-3 rounded-[24px] border border-[#FF7B7B]/20 bg-[#1C1C1E] p-4" role="alert">
          <p className="text-sm font-bold text-white">Couldn&apos;t check your positions</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-[#A7A7B7]">{analysisError}</p>
          <button type="button" onClick={() => { void refreshPortfolio(); }} className="mt-3 min-h-10 rounded-full bg-[#ccff00] px-4 text-xs font-black text-black transition-colors hover:bg-[#d7ff3d] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6" aria-labelledby="your-positions-title">
      <h2 id="your-positions-title" className="text-base font-semibold text-white">Your positions</h2>
      <div className="mt-3 rounded-[24px] border border-white/[0.08] bg-[#1C1C1E] px-5 py-6 text-center">
        <AppIcon icon="solar:wallet-bold" aria-hidden="true" width={28} height={28} className="mx-auto text-[#ccff00]" />
        <p className="mt-3 text-sm font-bold text-white">No active positions yet</p>
        <p className="mt-1 text-xs font-medium text-[#A7A7B7]">Your supplied yield positions will appear here.</p>
        <Link href="/explore" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[#ccff00] px-4 text-xs font-black text-black transition-colors hover:bg-[#d7ff3d] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">Explore markets</Link>
      </div>
    </section>
  );
}
