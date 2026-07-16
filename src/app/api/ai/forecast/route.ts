import { NextResponse } from "next/server";

/**
 * GET /api/ai/forecast?chainId=42161
 * Thin proxy to the agentkit's /api/yield-forecast. Returns an empty payload
 * (not an error) when the agentkit isn't configured so widgets degrade quietly.
 */
export async function GET(request: Request) {
  const chainId = new URL(request.url).searchParams.get("chainId") || undefined;
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ timestamp: null, chain_id: chainId, forecasts: [] });
  }
  try {
    const params = new URLSearchParams();
    if (chainId) params.set("chain_id", chainId);
    const res = await fetch(`${backendUrl}/api/ai/forecast?${params.toString()}`, { cache: "no-store" });
    const payload = await res.json();
    return NextResponse.json(payload, { status: res.status });
  } catch (error) {
    console.error("Agentkit forecast proxy failed", error);
    return NextResponse.json({ timestamp: null, chain_id: chainId, forecasts: [] }, { status: 502 });
  }
}
