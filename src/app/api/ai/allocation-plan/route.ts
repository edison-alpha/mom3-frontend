import { NextResponse } from "next/server";

const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: Request) {
  if (!backendUrl) return NextResponse.json({ error: "Backend URL is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const response = await fetch(`${backendUrl}/api/ai/allocation-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({ error: "Allocation engine returned invalid data." }));
  return NextResponse.json(payload, { status: response.status });
}
