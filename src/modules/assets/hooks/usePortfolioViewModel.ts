"use client";

import * as React from "react";

import { chainNameFromId, tokenIcon } from "@/lib/chain";
import { formatTokenBalance, formatUsd, formatUsdValue } from "@/lib/format";
import { normalizePrimaryAssetTokens } from "@/modules/send/utils/send.utils";
import type {
  PortfolioAsset,
  PortfolioPosition,
  PortfolioPositionResponse,
  PortfolioSummary,
} from "@/modules/assets/types/portfolio.types";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { usePortfolioIntelligence } from "@/modules/assets/hooks/usePortfolioIntelligence";
import { usePortfolioPreferences } from "@/modules/assets/hooks/usePortfolioPreferences";

function protocolIcon(project: string) {
  if (project === "aave-v3") return "simple-icons:aave";
  if (project === "compound-v3") return "simple-icons:compound";
  if (project === "morpho-blue") return "simple-icons:morpho";
  return "solar:wallet-money-bold";
}

function mapPosition(position: PortfolioPositionResponse): PortfolioPosition {
  return {
    id: `${position.market_id}-${position.chain_id}`,
    marketId: position.market_id,
    asset: position.asset,
    protocol: position.protocol,
    project: position.project,
    positionSymbol: position.position_symbol,
    balance: `${formatTokenBalance(position.supplied_balance)} ${position.asset}`,
    detail: `${position.apy.toFixed(2)}% APY`,
    chain: position.chain,
    chainId: position.chain_id,
    icon: tokenIcon(position.asset),
    protocolIcon: protocolIcon(position.project),
    amountInUSD: position.amount_in_usd,
    apy: position.apy,
    risk: position.risk,
    health: position.health,
  };
}

export function usePortfolioViewModel() {
  const {
    primaryAssets,
    accountInfo,
    isLoading: isAccountLoading,
    isDelegated,
    refreshAccount,
  } = useUniversalAccount();
  const tokens = React.useMemo(
    () => normalizePrimaryAssetTokens(primaryAssets, true),
    [primaryAssets],
  );
  const preferences = usePortfolioPreferences(tokens);
  const intelligence = usePortfolioIntelligence(
    [accountInfo.evmSmartAccount, accountInfo.solanaSmartAccount].filter(
      (account): account is string => Boolean(account),
    ),
    tokens,
  );
  const walletTotal = Number(primaryAssets?.totalAmountInUSD ?? 0) || 0;

  const allAssets = React.useMemo<PortfolioAsset[]>(() => tokens.map((token) => ({
    id: token.id,
    symbol: token.symbol,
    name: token.name,
    amount: `${formatTokenBalance(token.balance)} ${token.symbol}`,
    value: formatUsdValue(token.amountInUSD),
    chain: token.chainName || chainNameFromId(token.chainId),
    chainId: token.chainId,
    icon: token.icon || tokenIcon(token.symbol),
    allocation: walletTotal > 0 ? `${((token.amountInUSD / walletTotal) * 100).toFixed(1)}%` : "0%",
    price:
      token.balance > 0 && token.amountInUSD > 0
        ? formatUsd(token.amountInUSD / token.balance)
        : token.amountInUSD > 0
          ? formatUsd(token.amountInUSD)
          : "—",
    tokenAddress: token.tokenAddress,
    balance: token.balance,
    amountInUSD: token.amountInUSD,
  })), [tokens, walletTotal]);

  const visibleIds = React.useMemo(
    () => new Set(preferences.visibleTokens.map((token) => token.id)),
    [preferences.visibleTokens],
  );
  const assets = React.useMemo(
    () => allAssets.filter((asset) => visibleIds.has(asset.id)),
    [allAssets, visibleIds],
  );
  const positions = React.useMemo(
    () => (intelligence.data?.positions ?? []).map(mapPosition),
    [intelligence.data?.positions],
  );

  const liveSummary = intelligence.data?.summary;
  const summary: PortfolioSummary = {
    totalValue: liveSummary?.total_value ?? walletTotal,
    totalDisplay: formatUsdValue(liveSummary?.total_value ?? walletTotal),
    healthScore: liveSummary?.health_score ?? 0,
    netApy: liveSummary?.net_apy ?? 0,
    riskLevel: liveSummary?.risk_level ?? "Unavailable",
    chainCount: liveSummary?.chain_count ?? new Set(tokens.filter((token) => token.amountInUSD > 0).map((token) => token.chainId)).size,
    assetCount: liveSummary?.asset_count ?? tokens.filter((token) => token.amountInUSD > 0).length,
    protocolCount: liveSummary?.protocol_count ?? 0,
    yieldAllocation: liveSummary?.yield_allocation ?? 0,
    stableAllocation: liveSummary?.stable_allocation ?? 0,
  };

  return {
    assets,
    allAssets,
    positions,
    summary,
    indicators: intelligence.data?.indicators ?? [],
    recommendations: intelligence.data?.recommendations ?? [],
    coverage: intelligence.data?.coverage ?? null,
    analysisStatus: intelligence.data?.status ?? null,
    analysisUpdatedAt: intelligence.data?.timestamp ?? null,
    analysisError: intelligence.error instanceof Error ? intelligence.error.message : null,
    isLoading: isAccountLoading && !primaryAssets,
    isPortfolioLoading: intelligence.isLoading && !intelligence.data,
    isPortfolioRefreshing: intelligence.isFetching && Boolean(intelligence.data),
    isDelegated,
    refreshAccount,
    refreshPortfolio: intelligence.refetch,
    visibility: {
      allTokens: preferences.allTokens,
      hideZeroBalances: preferences.hideZeroBalances,
      hiddenAssetIds: preferences.hiddenAssetIds,
      setHideZeroBalances: preferences.setHideZeroBalances,
      toggleAsset: preferences.toggleAsset,
      showAllAssets: preferences.showAllAssets,
    },
  };
}

export type PortfolioViewModel = ReturnType<typeof usePortfolioViewModel>;
