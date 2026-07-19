"use client";

import { useQuery } from "@tanstack/react-query";

import type { TokenRow } from "@/modules/send/types/send.types";
import { analyzePortfolio } from "@/modules/assets/api/portfolio.api";
import { useRealtime } from "@/providers/realtime/components/RealtimeProvider";

function isSolanaAccount(account: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(account);
}

function assetsForAccount(account: string, tokens: TokenRow[]) {
  const solana = isSolanaAccount(account);
  return tokens.filter((token) => solana
    ? token.chainId === 101
    : token.chainId !== 101);
}

function assetFingerprint(tokens: TokenRow[]) {
  return tokens
    .map((token) => `${token.id}:${token.balance}:${token.amountInUSD}`)
    .sort()
    .join("|");
}

export function usePortfolioIntelligence(accounts: string[], tokens: TokenRow[]) {
  const { marketRevision } = useRealtime();
  const fingerprint = assetFingerprint(tokens);
  const accountKey = accounts.filter(Boolean).join(",");

  return useQuery({
    queryKey: ["portfolio-intelligence", accountKey, fingerprint, marketRevision],
    enabled: accounts.length > 0,
    staleTime: 20_000,
    retry: 2,
    // Market revisions should refresh analysis in the background. Keep the
    // last complete response visible so the health gauge never flashes to 0.
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const responses = await Promise.all(accounts.filter(Boolean).map((account) => analyzePortfolio({
          user_address: account,
          wallet_assets: assetsForAccount(account, tokens).map((token) => ({
            id: token.id,
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
            amount_in_usd: token.amountInUSD,
            chain: token.chainName,
            chain_id: token.chainId,
            token_address: token.tokenAddress,
          })),
        })));
      const first = responses[0];
      const positions = Array.from(
        new Map(
          responses
            .flatMap((response) => response.positions ?? [])
            .map((position) => [
              `${position.project}:${position.market_id}:${position.chain_id}`,
              position,
            ] as const),
        ).values(),
      );
      const totalValue = responses.reduce((sum, response) => sum + (response.summary?.total_value ?? 0), 0);
      const walletValue = responses.reduce((sum, response) => sum + (response.summary?.wallet_value ?? 0), 0);
      const positionValue = responses.reduce((sum, response) => sum + (response.summary?.position_value ?? 0), 0);
      return {
        ...first,
        account: accountKey,
        positions,
        summary: {
          ...first.summary,
          total_value: totalValue,
          wallet_value: walletValue,
          position_value: positionValue,
          protocol_count: new Set(positions.map((position) => position.project)).size,
          asset_count: new Set(positions.map((position) => position.asset)).size,
          chain_count: new Set(positions.map((position) => position.chain_id)).size,
        },
        coverage: {
          ...first.coverage,
          scanned_markets: responses.reduce((sum, response) => sum + (response.coverage?.scanned_markets ?? 0), 0),
          successful_market_reads: responses.reduce((sum, response) => sum + (response.coverage?.successful_market_reads ?? 0), 0),
          failed_market_reads: responses.reduce((sum, response) => sum + (response.coverage?.failed_market_reads ?? 0), 0),
        },
      };
    },
  });
}
