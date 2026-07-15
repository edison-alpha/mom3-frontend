import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { error: "Live execution requires MOM3_BACKEND_URL." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${backendUrl}/api/execution/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await response.text();
    let payload: unknown = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { error: "The execution backend returned an invalid response." };
    }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Execution backend proxy failed", error);
    return NextResponse.json(
      { error: "The execution service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
