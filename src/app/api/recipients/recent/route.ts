import { NextResponse } from "next/server";

function backendUrl() {
  return process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
}

export async function GET(request: Request) {
  const base = backendUrl();
  if (!base) return NextResponse.json({ error: "Backend recipients are not configured." }, { status: 503 });
  try {
    const incoming = new URL(request.url);
    const upstream = new URL("/api/recipients/recent", base);
    incoming.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));
    const response = await fetch(upstream, { cache: "no-store" });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch (error) {
    console.error("Recent recipients GET proxy failed", error);
    return NextResponse.json({ error: "Recent recipients are temporarily unavailable." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const base = backendUrl();
  if (!base) return NextResponse.json({ error: "Backend recipients are not configured." }, { status: 503 });
  try {
    const response = await fetch(new URL("/api/recipients/recent", base), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch (error) {
    console.error("Recent recipients POST proxy failed", error);
    return NextResponse.json({ error: "Recent recipients are temporarily unavailable." }, { status: 502 });
  }
}
