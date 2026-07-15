export type CurrencyCode = "USD" | "IDR" | "EUR";

export type CurrencyOption = {
  label: CurrencyCode;
  locale: string;
  rate: number;
};

export type PortfolioMode = {
  label: string;
  icon: string;
  title: string;
  description: string;
  metric: string;
  tone: string;
};

export type QuickActionLink = {
  label: string;
  href: string;
  icon: "deposit" | "convert" | "send";
  className: string;
};

export type OpportunityCard = {
  title: string;
  subtitle: string;
  icon: "yield";
};

export type EarnLink = {
  href: string;
  title: string;
  description: string;
  badge?: string;
  badgeClassName?: string;
  value?: string;
  valueClassName?: string;
};
