import type { AiStrategy, ChatMessage } from "../types/ai.types";

/**
 * Build an AI reply for the chat.
 *
 * Always calls the LLM via POST /api/ai/chat (proxied to the agentkit), passing
 * the conversation history and the selected chain so responses are context-aware.
 * When the message looks strategy-related, also fetch /api/ai/strategy and attach
 * the recommendation to a strategy-typed message so the UI can render the card.
 */
export async function createAiReply(
  message: string,
  history?: ChatMessage[],
  chainId?: number,
): Promise<ChatMessage> {
  const normalized = message.toLowerCase();
  const isStrategyQuestion = ["safe", "yield", "strategy", "rebalance", "risk", "apy", "allocation"].some((w) =>
    normalized.includes(w),
  );

  const historyPayload = (history ?? [])
    .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  // Fetch the LLM reply + (optionally) a live strategy in parallel.
  const chatPromise = fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: historyPayload, chainId }),
  }).then((r) => r.json().catch(() => ({}))) as Promise<{
    reply?: string;
    model?: string;
    context_used?: Record<string, unknown>;
  }>;

  const strategyPromise = isStrategyQuestion
    ? fetch("/api/ai/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ risk_tolerance: "moderate", chain_id: chainId }),
      })
        .then((r) => r.json().catch(() => null))
        .catch(() => null)
    : Promise.resolve(null);

  const [chat, strategy] = await Promise.all([chatPromise, strategyPromise]);

  const replyText =
    (chat && typeof chat.reply === "string" && chat.reply) ||
    fallbackReply(message);

  // A strategy-typed message renders the recommendation card; the LLM text is the caption.
  if (isStrategyQuestion && strategy && typeof strategy.expected_apy === "number") {
    return {
      id: Date.now() + 1,
      role: "assistant",
      kind: "strategy",
      content: replyText,
      strategy: strategy as AiStrategy,
      chainId,
      model: chat?.model,
    };
  }

  return {
    id: Date.now() + 1,
    role: "assistant",
    content: replyText,
    chainId,
    model: chat?.model,
  };
}

/** Last-resort reply if the agentkit is unreachable AND it wasn't a strategy question. */
function fallbackReply(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("risk") || normalized.includes("volatility")) {
    return "I would reduce exposure to volatile yield positions first, then keep new deposits in USDC until the portfolio risk score returns to low.";
  }
  return "I can compare your positions, risk level, and expected APY across chains, then suggest the smallest rebalance needed before you take action.";
}
