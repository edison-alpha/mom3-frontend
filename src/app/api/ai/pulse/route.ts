import { NextResponse } from "next/server";

/**
 * GET /api/ai/pulse?chainId=42161
 * Thin proxy to the agentkit's /api/liquidity-pulse. Returns an empty payload
 * (not an error) when the agentkit isn't configured so widgets degrade quietly.
 */
export async function GET(request: Request) {
  const chainId = new URL(request.url).searchParams.get("chainId") || undefined;
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ timestamp: null, chain_id: chainId, protocols: [] });
  }
  try {
    const params = new URLSearchParams();
    if (chainId) params.set("chain_id", chainId);
    const res = await fetch(`${backendUrl}/api/ai/pulse?${params.toString()}`, { cache: "no-store" });
    const payload = await res.json();
    return NextResponse.json(payload, { status: res.status });
  } catch (error) {
    console.error("Agentkit pulse proxy failed", error);
    return NextResponse.json({ timestamp: null, chain_id: chainId, protocols: [] }, { status: 502 });
  }
}
