import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ marketId: string }> },
) {
  const { marketId } = await context.params;
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({ timestamp: null, market: null }, { status: 503 });
  }

  try {
    const response = await fetch(
      `${backendUrl}/api/ai/markets/${encodeURIComponent(marketId)}`,
      { cache: "no-store" },
    );
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Agentkit market detail proxy failed", error);
    return NextResponse.json({ timestamp: null, market: null }, { status: 502 });
  }
}
