import AssetDetailView from "@/modules/asset-detail/AssetDetailView";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <AssetDetailView symbol={decodeURIComponent(symbol)} />;
}
