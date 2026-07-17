import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { error: "Live execution requires MOM3_BACKEND_URL.", markets: [] },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${backendUrl}/api/execution/markets`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({ error: "Invalid execution market response." }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Execution allowlist proxy failed", error);
    return NextResponse.json(
      { error: "The execution allowlist is temporarily unavailable.", markets: [] },
      { status: 502 },
    );
  }
}
