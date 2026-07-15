import { NextResponse } from "next/server";

/**
 * POST /api/ai/chat
 * Proxies the chat to the mom3 agentkit (LLM-powered, context-aware) when
 * MOM3_AGENTKIT_URL is set. Falls back to a canned reply otherwise so the chat
 * UI never breaks in a degraded/dev-without-backend state.
 *
 * Body: { message: string, history?: {role, content}[], chainId?: number, userAddress?: string }
 * Returns: { reply: string, timestamp?: string, context_used?: object, model?: string }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const message = typeof body.message === "string" ? body.message : "";

  if (!message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const agentkitUrl = process.env.MOM3_AGENTKIT_URL;
  if (agentkitUrl) {
    try {
      const agentResponse = await fetch(`${agentkitUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: Array.isArray(body.history) ? body.history : undefined,
          chain_id: typeof body.chainId === "number" ? body.chainId : undefined,
          user_address: typeof body.userAddress === "string" ? body.userAddress : undefined,
        }),
        cache: "no-store",
      });
      const payload = await agentResponse.json();
      return NextResponse.json(payload, { status: agentResponse.status });
    } catch (error) {
      console.error("Agentkit chat proxy failed", error);
      return NextResponse.json(
        { reply: "The AI agent is unreachable. Please make sure the agentkit server is running.", context_used: {} },
        { status: 502 },
      );
    }
  }

  // Degraded mode: no backend configured. Surface a clear, honest reply.
  return NextResponse.json({
    reply:
      "Live AI chat needs the agentkit service running. Set MOM3_AGENTKIT_URL and start the agentkit server to enable real responses.",
    context_used: { yield_data: false, liquidity_data: false, user_portfolio: false },
    model: "local-fallback",
  });
}
