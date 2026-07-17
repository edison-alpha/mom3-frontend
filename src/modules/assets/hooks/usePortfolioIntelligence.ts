"use client";

import { useQuery } from "@tanstack/react-query";

import type { TokenRow } from "@/modules/send/types/send.types";
import { analyzePortfolio } from "@/modules/assets/api/portfolio.api";
import { useRealtime } from "@/providers/realtime/components/RealtimeProvider";

function assetFingerprint(tokens: TokenRow[]) {
  return tokens
    .map((token) => `${token.id}:${token.balance}:${token.amountInUSD}`)
    .sort()
    .join("|");
}

export function usePortfolioIntelligence(account: string, tokens: TokenRow[]) {
  const { marketRevision } = useRealtime();
  const fingerprint = assetFingerprint(tokens);

  return useQuery({
    queryKey: ["portfolio-intelligence", account, fingerprint, marketRevision],
    enabled: Boolean(account),
    staleTime: 20_000,
    retry: 2,
    // Market revisions should refresh analysis in the background. Keep the
    // last complete response visible so the health gauge never flashes to 0.
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return analyzePortfolio({
          user_address: account,
          wallet_assets: tokens.map((token) => ({
            id: token.id,
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
            amount_in_usd: token.amountInUSD,
            chain: token.chainName,
            chain_id: token.chainId,
            token_address: token.tokenAddress,
          })),
        });
    },
  });
}
