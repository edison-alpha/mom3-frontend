import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Live positions require MOM3_BACKEND_URL." }, { status: 503 });
  }

  const { marketId } = await params;
  const account = new URL(request.url).searchParams.get("account");
  if (!account) {
    return NextResponse.json({ error: "Universal Account address is required." }, { status: 422 });
  }

  try {
    const upstream = new URL(
      `/api/execution/markets/${encodeURIComponent(marketId)}/position`,
      backendUrl,
    );
    upstream.searchParams.set("userAddress", account);
    const response = await fetch(upstream, { cache: "no-store" });
    const payload = await response.json().catch(() => ({ error: "Invalid position response." }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Yield position proxy failed", error);
    return NextResponse.json({ error: "The position service is temporarily unavailable." }, { status: 502 });
  }
}
