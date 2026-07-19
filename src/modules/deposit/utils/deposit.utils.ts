import type { IAssetsResponse } from "@particle-network/universal-account-sdk";

import type { DepositAsset } from "@/modules/deposit/types/deposit.types";
import { parseTokenAmount } from "@/lib/format";

export function getDepositAssetBalance(
  primaryAssets: IAssetsResponse | null | undefined,
  selectedAsset: DepositAsset,
) {
  for (const asset of primaryAssets?.assets ?? []) {
    for (const entry of asset.chainAggregation ?? []) {
      const sameChain = Number(entry.token.chainId) === selectedAsset.chainId;
      const sameAddress =
        String(entry.token.address ?? "").toLowerCase() ===
        selectedAsset.address.toLowerCase();

      if (sameChain && sameAddress) {
        return parseTokenAmount(
          entry.amount,
          Number(entry.token.realDecimals ?? entry.token.decimals ?? selectedAsset.decimals),
        );
      }
    }
  }

  return 0;
}

export function truncateDepositAddress(address: string, chars = 6) {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
