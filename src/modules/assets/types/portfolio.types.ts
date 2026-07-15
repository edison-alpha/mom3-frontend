import type { TokenRow } from "@/modules/send/types/send.types";

export type PortfolioRisk = "Low" | "Medium" | "High";
export type PortfolioAnalysisStatus = "ready" | "partial" | "empty";
export type PortfolioIndicatorTone = "positive" | "warning" | "critical" | "neutral";

export type PortfolioAsset = {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  value: string;
  chain: string;
  chainId: number;
  icon: string;
  allocation: string;
  price: string;
  tokenAddress: string;
  balance: number;
  amountInUSD: number;
};

export type PortfolioPosition = {
  id: string;
  marketId: string;
  asset: string;
  protocol: string;
  project: string;
  positionSymbol: string;
  balance: string;
  detail: string;
  chain: string;
  chainId: number;
  icon: string;
  protocolIcon: string;
  amountInUSD: number;
  apy: number;
  risk: PortfolioRisk;
  health: number;
};

export type PortfolioSummary = {
  totalValue: number;
  totalDisplay: string;
  healthScore: number;
  netApy: number;
  riskLevel: PortfolioRisk | "Unavailable";
  chainCount: number;
  assetCount: number;
  protocolCount: number;
  yieldAllocation: number;
  stableAllocation: number;
};

export type PortfolioIndicator = {
  id: string;
  label: string;
  score: number;
  status: string;
  tone: PortfolioIndicatorTone;
  value: string;
  detail: string;
};

export type PortfolioRecommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
};

export type PortfolioPositionResponse = {
  market_id: string;
  protocol: string;
  project: string;
  chain: string;
  chain_id: number;
  asset: string;
  position_symbol: string;
  position_contract: string;
  supplied_balance: number;
  supplied_balance_atomic: string;
  amount_in_usd: number;
  apy: number;
  tvl: number;
  risk_score: number;
  risk: PortfolioRisk;
  health: number;
  source: string;
};

export type PortfolioAnalysisResponse = {
  timestamp: string;
  account: string;
  source: string;
  status: PortfolioAnalysisStatus;
  summary: {
    total_value: number;
    wallet_value: number;
    position_value: number;
    health_score: number;
    risk_level: PortfolioRisk | "Unavailable";
    risk_score: number;
    net_apy: number;
    stable_allocation: number;
    yield_allocation: number;
    asset_count: number;
    chain_count: number;
    protocol_count: number;
    largest_asset: string | null;
    largest_asset_allocation: number;
  };
  positions: PortfolioPositionResponse[];
  indicators: PortfolioIndicator[];
  recommendations: PortfolioRecommendation[];
  coverage: {
    scanned_markets: number;
    successful_market_reads: number;
    failed_market_reads: number;
    confidence_score: number;
    receipt_value_deduplicated: number;
    failed_markets?: Array<{ market_id?: string; chain_id?: number; reason?: string }>;
  };
};

export type PortfolioPreferences = {
  hideZeroBalances: boolean;
  hiddenAssetIds: string[];
};

export type AssetVisibilityControls = {
  allTokens: TokenRow[];
  hideZeroBalances: boolean;
  hiddenAssetIds: Set<string>;
  setHideZeroBalances: (value: boolean) => void;
  toggleAsset: (assetId: string) => void;
  showAllAssets: () => void;
};
