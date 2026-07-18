import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const base = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!base) return NextResponse.json({ error: "Profile service is not configured." }, { status: 503 });
  try {
    const response = await fetch(`${base}/api/profile/avatar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch { return NextResponse.json({ error: "Profile upload service is temporarily unavailable." }, { status: 502 }); }
}
