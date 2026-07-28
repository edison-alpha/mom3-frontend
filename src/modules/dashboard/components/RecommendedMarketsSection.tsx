import Image from "next/image";
import Link from "next/link";
import { CoinIcon, DefiIcon, DexIcon } from "react-web3-icons/dynamic";

import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils";
import type { ExploreYieldPool } from "@/modules/explore/hooks/useExploreYields";
import { marketDetailHref } from "@/modules/explore/utils/market-detail-url";

type RecommendedMarketsSectionProps = {
  markets: ExploreYieldPool[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

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

const DEX_PROTOCOL_SLUGS = [
  "aerodrome", "camelot", "curve", "dydx", "pancakeswap", "sushiswap",
  "uniswap", "velodrome", "raydium",
] as const;

const TOKEN_SYMBOLS = ["USDC", "USDT", "USDE", "USDS", "WETH", "WBTC", "ETH", "BTC", "SOL", "DAI", "BNB", "ARB", "OP", "AVAX", "MATIC"];
const KAMINO_LOGO_URL = "/idLn9W035H_logos.png";

function assetTokens(asset: string) {
  const parts = asset
    .toUpperCase()
    .split(/[-/+:_\s]+/)
    .map((part) => part.replace(/\.E$/, ""));

  return [...new Set(parts.flatMap((part) => {
    const exact = TOKEN_SYMBOLS.find((symbol) => part === symbol);
    if (exact) return [exact];
    const embedded = TOKEN_SYMBOLS.find((symbol) => part.endsWith(symbol));
    return embedded ? [embedded] : [];
  }))].slice(0, 2);
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
    <span className="flex items-center" aria-hidden="true">
      {tokens.map((symbol, index) => (
        <span key={symbol} className={cn("relative flex items-center", index > 0 && "-ml-2")} style={{ zIndex: tokens.length - index }}>
          <CoinIcon
            symbol={coinIconSymbol(symbol)}
            variant="colored"
            size={tokens.length > 1 ? 32 : 42}
            fallback={<span className="text-xs font-black text-white">{symbol.slice(0, 1)}</span>}
          />
        </span>
      ))}
    </span>
  );
}

function ProtocolLogo({ protocol }: { protocol: string }) {
  const normalized = protocol.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const fallback = <span className="text-[11px] font-black uppercase text-white">{protocol.slice(0, 1)}</span>;

  if (normalized.includes("jupiter")) {
    return <Image src="/jupiter-ag-jup-logo.svg" alt="" width={26} height={26} className="h-[26px] w-[26px]" />;
  }

  if (normalized.includes("kamino")) {
    return <Image src={KAMINO_LOGO_URL} alt="" width={26} height={26} className="h-[26px] w-[26px] rounded-full" />;
  }

  const defiSlug = DEFI_PROTOCOL_SLUGS.find((slug) => normalized.includes(slug));

  if (defiSlug) return <DefiIcon name={defiSlug} variant="colored" size={26} fallback={fallback} />;

  const dexSlug = DEX_PROTOCOL_SLUGS.find((slug) => normalized.includes(slug));
  if (dexSlug) return <DexIcon name={dexSlug} variant="colored" size={26} fallback={fallback} />;

  return fallback;
}

function ChainLogo({ chainId, chain }: Pick<ExploreYieldPool, "chainId" | "chain">) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/25" title={chain} aria-hidden="true">
      <AppIcon icon={CHAIN_ICONS[chainId] ?? "solar:global-bold"} width={27} height={27} />
    </span>
  );
}

function recommendationLabel(market: ExploreYieldPool) {
  if (market.risk === "Low") return "Safe yield";
  if (market.risk === "Medium") return "Balanced yield";
  return "Growth yield";
}

function riskClass(risk: ExploreYieldPool["risk"]) {
  if (risk === "High") return "border-[#FF7B7B]/30 bg-[#FF7B7B]/10 text-[#FF9A9A]";
  if (risk === "Medium") return "border-[#A98BFF]/30 bg-[#A98BFF]/10 text-[#C5B4FF]";
  return "border-[#ccff00]/25 bg-[#ccff00]/10 text-[#ccff00]";
}

function RecommendedMarketSkeleton() {
  return (
    <div className="min-w-[88%] snap-start rounded-[26px] border border-white/[0.07] bg-[#17181d] p-3.5 sm:min-w-[352px]" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <span className="h-8 w-28 animate-pulse rounded-full bg-white/[0.08]" />
        <span className="h-8 w-20 animate-pulse rounded-lg bg-white/[0.08]" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="h-14 w-14 animate-pulse rounded-2xl bg-white/[0.08]" /><span className="h-7 w-28 animate-pulse rounded bg-white/[0.08]" /></div>
        <div className="flex gap-2"><span className="h-11 w-11 animate-pulse rounded-full bg-white/[0.08]" /><span className="h-11 w-11 animate-pulse rounded-full bg-white/[0.08]" /></div>
      </div>
      <span className="mt-3 block h-4 w-44 animate-pulse rounded bg-white/[0.08]" />
      <span className="mt-4 block h-9 w-48 animate-pulse rounded-full bg-white/[0.08]" />
    </div>
  );
}

export function RecommendedMarketsSection({ markets, isLoading, error, onRetry }: RecommendedMarketsSectionProps) {
  const recommendations = markets.slice(0, 3);

  return (
    <section className="mt-6" aria-labelledby="recommended-markets-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="recommended-markets-title" className="text-base font-semibold text-white">Recomended for you</h2>
          <p className="mt-1 text-xs font-medium text-[#A7A7B7]">Live opportunities selected from Explore.</p>
        </div>
        <Link href="/explore" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-bold text-[#ccff00] transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          Explore all
          <AppIcon icon="lucide:arrow-up-right" aria-hidden="true" width={15} height={15} />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2" role="status" aria-label="Loading recommended markets">
          <RecommendedMarketSkeleton />
          <RecommendedMarketSkeleton />
          <span className="sr-only">Loading recommended markets</span>
        </div>
      ) : error ? (
        <div className="mt-3 rounded-[24px] border border-[#FF7B7B]/20 bg-[#1C1C1E] p-4" role="alert">
          <p className="text-sm font-bold text-white">Couldn&apos;t load recommendations</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-[#A7A7B7]">{error}</p>
          <button type="button" onClick={onRetry} className="mt-3 min-h-10 rounded-full bg-[#ccff00] px-4 text-xs font-black text-black transition-colors hover:bg-[#d7ff3d] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            Try again
          </button>
        </div>
      ) : recommendations.length ? (
        <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {recommendations.map((market) => (
            <Link
              key={market.id}
              href={marketDetailHref(market)}
              aria-label={`Open recommended ${market.asset} market on ${market.protocol} and ${market.chain}`}
              className="group min-w-[88%] snap-start rounded-[26px] border border-white/[0.12] bg-[radial-gradient(circle_at_92%_0%,rgba(59,51,189,0.18),rgba(23,24,29,1)_52%)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[transform,background-color,border-color] duration-150 hover:border-[#ccff00]/35 hover:bg-[#1d1e23] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:hover:-translate-y-0.5 sm:min-w-[352px]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 text-xs font-bold text-white">
                  <AppIcon icon={market.risk === "Low" ? "solar:shield-check-bold" : market.risk === "Medium" ? "solar:scale-bold" : "solar:graph-up-bold"} aria-hidden="true" width={15} height={15} className="text-[#ccff00]" />
                  {recommendationLabel(market)}
                </span>
                <span className="text-right">
                  <span className="block font-mono text-2xl font-black leading-none tabular-nums text-[#ccff00]">{market.apy.toFixed(2)}%</span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#ccff00]">APY</span>
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#2A2A3E]">
                    <AssetLogo asset={market.asset} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-black leading-none text-white">{market.asset}</h3>
                    <p className="mt-1.5 truncate text-sm font-medium text-[#A7A7B7]">{market.protocol} · {market.chain}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2" aria-label={`${market.protocol} on ${market.chain}`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25" title={market.protocol} aria-hidden="true">
                    <ProtocolLogo protocol={market.protocol} />
                  </span>
                  <ChainLogo chainId={market.chainId} chain={market.chain} />
                </div>
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#ccff00]">
                <AppIcon icon="solar:stars-bold" aria-hidden="true" width={18} height={18} />
                AI recommended
              </p>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn("inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-black", riskClass(market.risk))}>
                    <AppIcon icon="solar:shield-check-bold" aria-hidden="true" width={15} height={15} />
                    {market.risk.toUpperCase()} RISK
                  </span>
                  <span className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 text-xs font-black text-[#53F47C]">
                    <span className="h-2 w-2 rounded-full bg-[#53F47C]" aria-hidden="true" />
                    LIVE
                  </span>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#A7A7B7]">TVL {market.tvl}<AppIcon icon="lucide:arrow-up-right" aria-hidden="true" width={17} height={17} className="text-white transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-[24px] border border-white/[0.08] bg-[#1C1C1E] px-5 py-6 text-center">
          <AppIcon icon="solar:chart-2-bold" aria-hidden="true" width={28} height={28} className="mx-auto text-[#ccff00]" />
          <p className="mt-3 text-sm font-bold text-white">No recommendations yet</p>
          <p className="mt-1 text-xs font-medium text-[#A7A7B7]">Browse the live market to find a yield opportunity.</p>
          <Link href="/explore" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[#ccff00] px-4 text-xs font-black text-black transition-colors hover:bg-[#d7ff3d] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            Browse Explore
          </Link>
        </div>
      )}
    </section>
  );
}
