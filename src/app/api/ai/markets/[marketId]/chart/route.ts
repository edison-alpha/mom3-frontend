import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const agentkitUrl = process.env.MOM3_AGENTKIT_URL;
  if (!agentkitUrl) {
    return NextResponse.json({ points: [], error: "Agentkit is not configured." }, { status: 503 });
  }

  try {
    const { marketId } = await params;
    const response = await fetch(
      `${agentkitUrl}/api/yield-markets/${encodeURIComponent(marketId)}/chart`,
      { cache: "no-store" },
    );
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Agentkit market chart proxy failed", error);
    return NextResponse.json({ points: [], error: "Live yield chart is unavailable." }, { status: 502 });
  }
}
