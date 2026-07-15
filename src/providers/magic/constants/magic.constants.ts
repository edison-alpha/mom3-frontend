import { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";

export { DEFAULT_CHAIN_ID };

export const magicQueryKeys = {
  instance: ["magic", "instance"] as const,
  session: ["magic", "session"] as const,
};

export const MAGIC_CHAIN_CONFIGS = [
  {
    chainId: 1,
    rpcUrl:
      process.env.NEXT_PUBLIC_ETH_RPC_URL ||
      "https://ethereum-rpc.publicnode.com",
  },
  {
    chainId: 42161,
    rpcUrl: process.env.NEXT_PUBLIC_ARB_RPC_URL || "https://arb1.arbitrum.io/rpc",
  },
  {
    chainId: 8453,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
  },
  {
    chainId: 10,
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  },
  {
    chainId: 137,
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
  },
  {
    chainId: 56,
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed.binance.org",
  },
].map((chain) => ({
  ...chain,
  default: chain.chainId === DEFAULT_CHAIN_ID,
}));

if (!MAGIC_CHAIN_CONFIGS.some((chain) => chain.default)) {
  MAGIC_CHAIN_CONFIGS[0] = {
    ...MAGIC_CHAIN_CONFIGS[0],
    default: true,
  };
}
