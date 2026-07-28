import type { ExploreYieldPool } from "../hooks/useExploreYields";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Keeps every entry point pointed at the canonical Explore market detail route. */
export function marketDetailHref(item: ExploreYieldPool) {
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
