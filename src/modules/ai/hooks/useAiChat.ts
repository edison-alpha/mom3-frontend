"use client";

import * as React from "react";

import { createAiReply } from "../utils/api";
import { initialMessages } from "../constants/ai";
import type { ChatMessage } from "../types/ai.types";

export function useAiChat(chainId?: number) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);

  const userTurns = React.useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages],
  );

  const showRecommendations = userTurns >= 3;

  const sendMessage = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();

      if (!trimmed || isThinking) return;

      const userMessage: ChatMessage = {
        id: Date.now(),
        role: "user",
        content: trimmed,
        chainId,
      };

      setMessages((current) => [...current, userMessage]);
      setInput("");
      setIsThinking(true);

      try {
        const reply = await createAiReply(trimmed, messages, chainId);
        setMessages((current) => [...current, reply]);
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages, chainId],
  );

  return {
    input,
    isThinking,
    messages,
    showRecommendations,
    setInput,
    sendMessage,
  };
}
