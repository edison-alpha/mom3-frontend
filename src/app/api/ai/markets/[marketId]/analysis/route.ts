import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ marketId: string }> }) {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ error: "Backend is not configured." }, { status: 503 });
  try {
    const { marketId } = await params;
    const response = await fetch(`${backendUrl}/api/ai/markets/${encodeURIComponent(marketId)}/analysis`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Market analysis proxy failed", error);
    return NextResponse.json({ error: "Market analysis is unavailable." }, { status: 502 });
  }
}
