import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { error: "Portfolio intelligence requires MOM3_BACKEND_URL." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  try {
    const response = await fetch(`${backendUrl}/api/ai/portfolio/analyze`, {
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
