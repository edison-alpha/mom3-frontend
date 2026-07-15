export type ChatRole = "assistant" | "user";

export type ChatMessageKind = "text" | "strategy";

export type ChatMessage = {
  id: number;
  role: ChatRole;
  content: string;
  kind?: ChatMessageKind;
  strategy?: AiStrategy;
  chainId?: number;
  model?: string;
};

export type AiStrategy = {
  protocol: string;
  asset: string;
  network: string;
  expected_apy: number;
  risk_score: number;
  health_score: number;
  reasoning: string;
  live_data_source: string;
  last_updated: string;
  // Multi-chain additions from the agentkit (optional, backward-compatible).
  chain_id?: number | null;
  home_chain?: number | null;
  home_chain_name?: string | null;
  scanned_chain_count?: number;
  scanned_chains?: number[];
  allocations?: Record<string, number>;
  chain_allocations?: Array<{
    protocol: string;
    chain_id: number;
    allocation: number;
    expected_apy: number;
    risk_score: number;
  }>;
  opportunities?: StrategyOpportunity[];
  diversification_score?: number;
  forecast?: YieldForecastData[];
  liquidity_pulse?: PulseData[];
};

export type YieldForecastData = {
  protocol: string;
  current_apy: number;
  forecast_7d: number[];
  trend: string;
  weather?: string;
  confidence?: number;
  chain?: string;
  chain_id?: number;
};

export type PulseData = {
  protocol: string;
  pulse_score: number;
  status: string;
  tvl: number;
  tvl_change_24h?: number;
  net_flow?: string;
  timestamp?: string;
  is_anomaly?: boolean;
  alert?: string | null;
};

export type StrategyOpportunity = {
  market_id?: string;
  protocol: string;
  pool: string;
  pool_id?: string | null;
  asset: string;
  chain: string;
  chain_id: number;
  allocation: number;
  apy: number;
  apy_base?: number;
  apy_reward?: number;
  apy_change_1d?: number | null;
  tvl: number;
  utilization?: number | null;
  risk_score: number;
  stablecoin?: boolean;
  exposure?: string | null;
  impermanent_loss?: string | null;
  source: string;
  execution?: {
    enabled: boolean;
    actions?: Array<"supply" | "withdraw">;
    type?: "aave-v3" | "compound-v3" | "morpho-vault-v1" | null;
    requires_user_confirmation?: boolean;
    uses_eip7702?: boolean;
    contract?: string | null;
    asset_address?: string | null;
    asset_decimals?: number | null;
    position_symbol?: string | null;
  };
  forecast?: YieldForecastData | null;
  liquidity_pulse?: PulseData | null;
};

export type AiExecutionIntent = {
  intent_id: string;
  market_id: string;
  action: "supply" | "withdraw";
  protocol: string;
  project: string;
  execution_type: "aave-v3" | "compound-v3" | "morpho-vault-v1";
  chain: string;
  chain_id: number;
  amount: string;
  amount_atomic: string;
  asset: {
    symbol: string;
    address: string;
    decimals: number;
  };
  receiver: string;
  position_symbol: string;
  calls: Array<{
    to: string;
    method: "approve" | "supply" | "deposit" | "withdraw";
    args: Array<string | number>;
  }>;
  policy: {
    execution_mode: "user-confirmed";
    requires_eip7702: boolean;
    cross_chain_funding_supported: boolean;
    max_amount_usd: number;
    slippage_bps: number;
  };
  source: string;
  transactions: Array<{ to: string; data: string }>;
  validated_by: "mom3-backend";
};

export type RecommendationChip = {
  icon: string;
  label: string;
};

export type RecommendationItem = {
  title: string;
  description: string;
  badge: string;
  icon: string;
  iconTone: string;
  chips: RecommendationChip[];
};
