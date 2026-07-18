import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ error: "AI market analysis is not configured." }, { status: 503 });
  try {
    const query = new URL(request.url).searchParams;
    const response = await fetch(`${backendUrl}/api/ai/market-analysis?${query.toString()}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("AI market analysis proxy failed", error);
    return NextResponse.json({ error: "AI market analysis is temporarily unavailable." }, { status: 502 });
  }
}
