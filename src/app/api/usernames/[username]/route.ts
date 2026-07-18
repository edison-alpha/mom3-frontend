import { NextResponse } from "next/server";

function backendUrl() { return process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL; }

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {
  const base = backendUrl();
  if (!base) return NextResponse.json({ error: "Username service is not configured." }, { status: 503 });
  try {
    const { username } = await context.params;
    const incoming = new URL(request.url);
    const upstream = new URL(`/api/usernames/${encodeURIComponent(username)}`, base);
    incoming.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));
    const response = await fetch(upstream, { cache: "no-store" });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch { return NextResponse.json({ error: "Username service is temporarily unavailable." }, { status: 502 }); }
}
