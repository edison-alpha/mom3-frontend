export type MarketDetailAnalysis = {
  confidence: { score: number; percent: number; label: string; explanation: string };
  market_outlook: { label: string; trend: string; probability: number; forecast_7d: number[]; reasoning: string };
  summary: string;
  recommendation: "consider" | "watch";
  sections: Array<{ title: string; points: string[] }>;
  forecast?: { forecast_7d?: number[]; confidence?: number; trend?: string };
  liquidity_pulse?: { status?: string; pulse_score?: number };
};

export type MarketAnalysisResponse = {
  timestamp?: string;
  data_source?: string;
  analysis?: MarketDetailAnalysis;
};
