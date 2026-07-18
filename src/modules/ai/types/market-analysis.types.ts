export type MarketAnalysisPageParams = {
  page?: number;
  pageSize?: number;
  chainId?: number;
  riskTolerance?: "conservative" | "moderate" | "aggressive";
};

export type SeniorMarketAnalysis = {
  confidence: { score: number; percent: number; label: string; explanation: string };
  market_outlook: { label: string; trend: string; probability: number; forecast_7d: number[]; reasoning: string };
  summary: string;
  recommendation: "consider" | "watch" | "avoid";
  risk_policy?: { mode: "conservative" | "moderate" | "aggressive"; max_risk_score: number; within_mode: boolean; execution_ready: boolean };
  sections: Array<{ title: string; points: string[] }>;
  forecast?: { confidence?: number; trend?: string; forecast_7d?: number[] };
  liquidity_pulse?: { status?: string; pulse_score?: number };
};

export type MarketAnalysisItem = {
  market_id: string;
  rank: number;
  protocol: string;
  symbol: string;
  asset: string;
  chain: string;
  chain_id: number;
  apy: number;
  apy_base?: number;
  apy_reward?: number;
  tvl: number;
  risk_score: number;
  opportunity_score?: number;
  execution?: { enabled?: boolean };
  analysis: SeniorMarketAnalysis;
};

export type MarketAnalysisPage = {
  timestamp?: string;
  data_source?: string;
  analysis: { engine: string; scope: string; market_count: number; summary: string };
  markets: MarketAnalysisItem[];
  pagination: { page: number; page_size: number; total: number; has_next: boolean; next_page: number | null };
};
