import {
  SUPPORTED_PRIMARY_TOKENS,
  UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS,
} from "@particle-network/universal-account-sdk";

import type {
  DepositAsset,
  DepositNetwork,
} from "@/modules/deposit/types/deposit.types";
import { chainBadgeIconFromId, chainNameFromId, tokenIcon } from "@/lib/chain";

const particleChainIds = Array.from(
  new Set(
    SUPPORTED_PRIMARY_TOKENS
      .map((token) => Number(token.chainId))
      .filter((chainId) =>
        UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS.map(Number).includes(chainId),
      ),
  ),
);

export const depositNetworks: DepositNetwork[] = particleChainIds
  .sort((left, right) => {
    const order = [8453, 42161, 1, 56, 101];
    return (order.indexOf(left) < 0 ? 99 : order.indexOf(left))
      - (order.indexOf(right) < 0 ? 99 : order.indexOf(right));
  })
  .map((chainId) => ({
    chainId,
    name: chainNameFromId(chainId),
    shortName: chainNameFromId(chainId).replace(" One", ""),
    kind: chainId === 101 ? "solana" : "evm",
    icon: chainBadgeIconFromId(chainId),
  }));

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

// Convert can target any primary asset exposed by the installed Particle SDK.
// Keep only chains with at least one concrete SDK asset.
export const convertNetworks: DepositNetwork[] = depositNetworks.filter((network) =>
  getDepositAssetsForChain(network.chainId).length > 0,
);
