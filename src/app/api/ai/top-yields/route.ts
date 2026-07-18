import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Top yield backend is not configured.", markets: [] }, { status: 503 });
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const params = new URLSearchParams({ limit: searchParams.get("limit") || "10" });
    const chainId = searchParams.get("chain_id") || searchParams.get("chainId");
    if (chainId) params.set("chain_id", chainId);
    const response = await fetch(`${backendUrl}/api/markets/top-yields?${params.toString()}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({ markets: [] }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Top yield proxy failed", error);
    return NextResponse.json({ error: "Top yield analysis is temporarily unavailable.", markets: [] }, { status: 502 });
  }
}
