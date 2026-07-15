import type {
  CurrencyCode,
  CurrencyOption,
  EarnLink,
  OpportunityCard,
  PortfolioMode,
  QuickActionLink,
} from "../types/dashboard.types";

export const avatarStackColors = [
  "bg-[#ccff00]",
  "bg-[#3B33BD]",
  "bg-[#ff7a45]",
] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export const portfolioModes: PortfolioMode[] = [
  {
    label: "Degen",
    icon: "degen-doge",
    title: "Chase higher APY",
    description: "Aggressive yield routes with tighter health checks.",
    metric: "11.2%",
    tone: "High risk",
  },
  {
    label: "Balanced",
    icon: "solar:scale-bold",
    title: "Optimize steady growth",
    description: "Mix stable and adaptive yield positions.",
    metric: "5.9%",
    tone: "Medium risk",
  },
  {
    label: "Safe",
    icon: "solar:shield-check-bold",
    title: "Protect capital",
    description: "Prioritize blue-chip markets and low volatility.",
    metric: "4.8%",
    tone: "Low risk",
  },
];

export const currencyOptions: Record<CurrencyCode, CurrencyOption> = {
  USD: { label: "USD", locale: "en-US", rate: 1 },
  IDR: { label: "IDR", locale: "id-ID", rate: 17900 },
  EUR: { label: "EUR", locale: "de-DE", rate: 0.92 },
};

export const quickActionLinks: QuickActionLink[] = [
  {
    label: "Send",
    href: "/send",
    icon: "send",
    className: "bg-[#242426] text-white",
  },
  {
    label: "Convert",
    href: "/convert",
    icon: "convert",
    className: "bg-[#242426] text-white",
  },
  {
    label: "Deposit",
    href: "/deposit",
    icon: "deposit",
    className: "bg-[#ccff00] text-[#3B33BD]",
  },
];

export const opportunityCards: OpportunityCard[] = [
  {
    title: "Explore Yield",
    subtitle: "Discover opportunities",
    icon: "yield",
  },
  {
    title: "AI Yield Strategy",
    subtitle: "Automate your allocation",
    icon: "yield",
  },
];

export function createEarnLinks(
  balanceLabel: string,
): EarnLink[] {
  return [
    {
      href: "/assets",
      title: "Your Assets",
      description: "Manage and track your portfolio",
      value: balanceLabel,
      valueClassName:
        "border border-[#3B33BD]/25 bg-[#15142a] text-[#3B33BD]",
    },
    {
      href: "/ai",
      title: "AI Yield Strategy",
      description: "Automate your yield allocation with AI",
      badge: "Beta",
      badgeClassName: "bg-[#3B33BD]/20 text-[#8F89FF]",
      value: "Smart",
      valueClassName:
        "border border-[#ccff00]/20 bg-[#1d250b] text-[#ccff00]",
    },
  ];
}
