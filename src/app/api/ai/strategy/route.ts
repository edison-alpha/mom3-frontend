import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json({ error: "Live strategy backend is not configured." }, { status: 503 });
    }
    const agentResponse = await fetch(`${backendUrl}/api/ai/strategy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const responseText = await agentResponse.text();
    let agentPayload: unknown;
    try { agentPayload = responseText ? JSON.parse(responseText) : {}; }
    catch { agentPayload = { error: `Agentkit strategy failed (${agentResponse.status}).` }; }
    return NextResponse.json(agentPayload, { status: agentResponse.status });
  } catch (error) {
    console.error("AI strategy generation failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? `AI strategy service unavailable: ${error.message}`
          : "AI strategy service is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
