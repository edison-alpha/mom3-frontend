import type { Metadata, Viewport } from "next";
import AiChatView from "@/modules/ai/AiChatView";

export const metadata: Metadata = {
  title: "Smart Strategies",
  description: "AI assistant for mom3 Smart Strategies.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AiPage() {
  return <AiChatView />;
}
