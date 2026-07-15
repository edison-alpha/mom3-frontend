import {
  CHAIN_ID,
  SUPPORTED_PRIMARY_TOKENS,
} from "@particle-network/universal-account-sdk";

import type {
  DepositAsset,
  DepositNetwork,
} from "@/modules/deposit/types/deposit.types";
import { tokenIcon } from "@/lib/chain";

export const depositNetworks: DepositNetwork[] = [
  {
    chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
    name: "Arbitrum One",
    shortName: "Arbitrum",
    kind: "evm",
    icon: "token-branded:arbitrum",
  },
  {
    chainId: CHAIN_ID.BASE_MAINNET,
    name: "Base",
    shortName: "Base",
    kind: "evm",
    icon: "token-branded:base",
  },
  {
    chainId: CHAIN_ID.SOLANA_MAINNET,
    name: "Solana",
    shortName: "Solana",
    kind: "solana",
    icon: "token-branded:solana",
  },
];

const tokenNames: Record<string, string> = {
  ETH: "Ether",
  SOL: "Solana",
  USDC: "USD Coin",
  USDT: "Tether USD",
};

const tokenOrder = ["USDC", "USDT", "ETH", "SOL"];

export const depositAssets: DepositAsset[] = SUPPORTED_PRIMARY_TOKENS.map((token) => {
  const symbol = String(token.type).toUpperCase();

  return {
    id: `${token.chainId}-${String(token.address).toLowerCase()}-${symbol}`,
    chainId: Number(token.chainId),
    type: String(token.type),
    symbol,
    name: tokenNames[symbol] ?? symbol,
    address: String(token.address),
    decimals: Number(token.realDecimals ?? token.decimals ?? 18),
    icon: tokenIcon(symbol),
  };
}).sort((left, right) => {
  const leftIndex = tokenOrder.indexOf(left.symbol);
  const rightIndex = tokenOrder.indexOf(right.symbol);
  return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex);
});

export function getDepositAssetsForChain(chainId: number) {
  return depositAssets.filter((asset) => asset.chainId === chainId);
}
