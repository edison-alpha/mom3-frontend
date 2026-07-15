import type { MarketDetail } from "@/lib/portfolio-data";
import MarketDetailView from "@/modules/market-detail/MarketDetailView";

export default async function ExploreMarketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const value = (key: string) => {
    const raw = query[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };
  const chainId = Number(value("chainId"));
  const marketId = value("marketId");

  // Identity only. Financial metrics are fetched live in MarketDetailView and
  // are never populated from URL parameters or the old portfolio mock catalog.
  const marketIdentity: MarketDetail = {
    slug: id,
    chainId: Number.isFinite(chainId) && chainId > 0 ? chainId : undefined,
    asset: value("asset") || "Asset",
    protocol: value("protocol") || "Protocol",
    primary: "",
    secondary: value("chain") || "",
    icon: value("icon") || "solar:graph-up-bold",
    color: "bg-[#2A2A3E]",
    category: value("category") === "Risk" ? "Risk" : "Yield",
    tvl: "",
    utilization: "",
    risk: "Low",
    description: "",
    chartData: { "1D": [], "1W": [], "1M": [], "1Y": [] },
  };

  return (
    <MarketDetailView
      market={marketIdentity}
      executionMarketId={marketId}
    />
  );
}
