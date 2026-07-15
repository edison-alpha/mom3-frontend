"use client";

import { useQuery } from "@tanstack/react-query";

import type { TokenRow } from "@/modules/send/types/send.types";
import type { PortfolioAnalysisResponse } from "@/modules/assets/types/portfolio.types";
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
    retry: 1,
    queryFn: async () => {
      const response = await fetch("/api/ai/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Portfolio analysis is unavailable.");
      }
      return payload as PortfolioAnalysisResponse;
    },
  });
}
