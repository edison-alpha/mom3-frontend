export type YieldAction = "supply" | "withdraw";

export type YieldPosition = {
  market_id: string;
  protocol: string;
  project: string;
  chain: string;
  chain_id: number;
  asset: { symbol: string; address: string; decimals: number };
  position_symbol: string;
  position_contract: string;
  wallet_balance: number;
  wallet_balance_atomic: string;
  supplied_balance: number;
  supplied_balance_atomic: string;
  source: "protocol-onchain";
};
