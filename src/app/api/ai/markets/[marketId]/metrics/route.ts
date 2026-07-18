import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ metrics: null, error: "Backend is not configured." }, { status: 503 });
  }

  try {
    const { marketId } = await params;
    const response = await fetch(
      `${backendUrl}/api/markets/${encodeURIComponent(marketId)}/metrics`,
      { cache: "no-store" },
    );
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Market metrics proxy failed", error);
    return NextResponse.json({ metrics: null, error: "Market metrics are unavailable." }, { status: 502 });
  }
}
