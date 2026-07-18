import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ ownerAddress: string }> }) {
  const base = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!base) return NextResponse.json({ error: "Profile service is not configured." }, { status: 503 });
  try {
    const { ownerAddress } = await context.params;
    const response = await fetch(`${base}/api/profile/${encodeURIComponent(ownerAddress)}`, { cache: "no-store" });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch { return NextResponse.json({ error: "Profile service is temporarily unavailable." }, { status: 502 }); }
}
