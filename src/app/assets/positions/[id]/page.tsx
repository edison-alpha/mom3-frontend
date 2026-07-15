import PositionDetailView from "@/modules/position-detail/PositionDetailView";

export const dynamic = "force-dynamic";

// The slug is informational. The chain is read from the `chainId` search param so
// the live on-chain Aave position is fetched for the right network; defaults to
// Arbitrum (42161) when omitted.
export default async function PositionDetailPage({
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chainId?: string }>;
}) {
  const { chainId } = await searchParams;
  const parsed = chainId ? Number(chainId) : Number.NaN;
  return <PositionDetailView chainId={Number.isFinite(parsed) ? parsed : undefined} />;
}
