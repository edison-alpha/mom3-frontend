import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const base = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!base) return NextResponse.json({ error: "Backend history is not configured." }, { status: 503 });
  try {
    const incoming = new URL(request.url);
    const upstream = new URL("/api/history/summary", base);
    incoming.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));
    const response = await fetch(upstream, { cache: "no-store" });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch (error) {
    console.error("History summary proxy failed", error);
    return NextResponse.json({ error: "History summary is temporarily unavailable." }, { status: 502 });
  }
}
