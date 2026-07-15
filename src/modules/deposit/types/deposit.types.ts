export type DepositNetworkKind = "evm" | "solana";

export type DepositNetwork = {
  chainId: number;
  name: string;
  shortName: string;
  kind: DepositNetworkKind;
  icon: string;
};

export type DepositAsset = {
  id: string;
  chainId: number;
  type: string;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: string;
};

export type DepositMonitorStatus = "initializing" | "watching" | "received";

