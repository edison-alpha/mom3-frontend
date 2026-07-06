import type { ChatMessage, RecommendationItem } from "../type/ai";

export const recommendations: RecommendationItem[] = [
  {
    title: "Safest Yield Strategy",
    description: "Low risk, stable returns with blue-chip DeFi protocols.",
    badge: "AI PICK",
    icon: "solar:shield-check-bold",
    iconTone: "text-[#ccff00]",
    chips: [
      { icon: "cryptocurrency-color:usdc", label: "USDC" },
      { icon: "token-branded:aave", label: "Aave" },
      { icon: "cryptocurrency-color:eth", label: "Ethereum" },
    ],
  },
  {
    title: "Rebalance Suggestion",
    description: "Shift allocation to optimize your risk-adjusted returns.",
    badge: "+0.42% APY",
    icon: "solar:chart-square-bold",
    iconTone: "text-[#5A52FF]",
    chips: [
      { icon: "cryptocurrency-color:usdc", label: "USDC" },
      { icon: "token-branded:ethena", label: "Ethena" },
      { icon: "solar:global-bold", label: "EVM" },
    ],
  },
  {
    title: "Risk Alert",
    description: "High volatility detected on 2 positions. Review recommended.",
    badge: "MEDIUM RISK",
    icon: "solar:danger-triangle-bold",
    iconTone: "text-[#ccff00]",
    chips: [
      { icon: "cryptocurrency-color:usdt", label: "USDT" },
      { icon: "token-branded:pendle", label: "Pendle" },
      { icon: "token-branded:manta", label: "Manta" },
    ],
  },
];

export const initialMessages: ChatMessage[] = [];
