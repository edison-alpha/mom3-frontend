export type AaveMarketConfig = {
  chainId: number;
  network: string;
  pool: string;
  usdc: string;
  usdcDecimals: number;
  rpcUrl: string;
  historySlug: string;
};

export const AAVE_MARKETS: Record<number, AaveMarketConfig> = {
  42161: {
    chainId: 42161,
    network: "Arbitrum One",
    pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    usdcDecimals: 6,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    historySlug: "aave-v3-arbitrum",
  },
  8453: {
    chainId: 8453,
    network: "Base",
    pool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    usdcDecimals: 6,
    rpcUrl: "https://mainnet.base.org",
    historySlug: "aave-v3-base",
  },
};

export const DEFAULT_AAVE_CHAIN_ID = 42161;
export const AAVE_ARBITRUM = AAVE_MARKETS[DEFAULT_AAVE_CHAIN_ID];

export function getAaveMarketConfig(chainId?: number) {
  return AAVE_MARKETS[chainId || DEFAULT_AAVE_CHAIN_ID] || null;
}

export const AAVE_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  "function withdraw(address asset, uint256 amount, address to) returns (uint256)",
  "function getReserveData(address asset) view returns (uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
] as const;

export const ERC20_APPROVAL_ABI = [
  "function approve(address spender, uint256 amount)",
  "function balanceOf(address account) view returns (uint256)",
] as const;
