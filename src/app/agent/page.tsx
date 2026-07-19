import type { Metadata } from "next";

import AiChatView from "@/modules/ai/AiChatView";

export const metadata: Metadata = {
  title: "mom3 /agent",
  description: "Ask mom3 to analyze your portfolio and yield strategy.",
};

export default function AgentPage() {
  return <AiChatView />;
}
