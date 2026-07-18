import { NextResponse } from "next/server";

function backendUrl() { return process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL; }

export async function POST(request: Request) {
  const base = backendUrl();
  if (!base) return NextResponse.json({ error: "Username service is not configured." }, { status: 503 });
  try {
    const response = await fetch(new URL("/api/usernames/claim", base), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()), cache: "no-store" });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch { return NextResponse.json({ error: "Username service is temporarily unavailable." }, { status: 502 }); }
}
