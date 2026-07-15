import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const agentkitUrl = process.env.MOM3_AGENTKIT_URL;
  if (!agentkitUrl) {
    return NextResponse.json(
      { error: "Portfolio intelligence requires MOM3_AGENTKIT_URL." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  try {
    const response = await fetch(`${agentkitUrl}/api/portfolio/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const payload = await response.json().catch(() => ({
      error: "Agentkit returned an invalid portfolio response.",
    }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Portfolio intelligence proxy failed", error);
    return NextResponse.json(
      { error: "Portfolio intelligence is temporarily unavailable." },
      { status: 502 },
    );
  }
}
