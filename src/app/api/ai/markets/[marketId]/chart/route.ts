import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ points: [], error: "Agentkit is not configured." }, { status: 503 });
  }

  try {
    const { marketId } = await params;
    const range = new URL(request.url).searchParams.get("range");
    const response = await fetch(
      `${backendUrl}/api/markets/${encodeURIComponent(marketId)}/history${range ? `?range=${encodeURIComponent(range)}` : ""}`,
      { cache: "no-store" },
    );
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Agentkit market chart proxy failed", error);
    return NextResponse.json({ points: [], error: "Live yield chart is unavailable." }, { status: 502 });
  }
}
