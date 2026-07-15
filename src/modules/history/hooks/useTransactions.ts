"use client";

import * as React from "react";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { chainNameFromId } from "@/lib/chain";
import { formatUsdValue } from "@/lib/format";

export type RealHistoryItem = {
  id: string;
  title: string;
  description: string;
  amount: string;
  time: string;
  status: string;
  network: string;
  reference: string;
  note: string;
  icon: string;
  tone: "green" | "purple" | "blue";
};

function relativeTime(timestamp?: number | string): string {
  if (!timestamp) return "Recently";
  const ts = typeof timestamp === "string" ? Date.parse(timestamp) : timestamp * 1000;
  if (!Number.isFinite(ts)) return "Recently";
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function summarizeTransaction(raw: any): RealHistoryItem {
  const id = String(raw?.transactionId || raw?.id || raw?.hash || Math.random());
  const status = String(raw?.status || raw?.transactionStatus || "Completed");
  const chainId = Number(raw?.chainId || raw?.originChainId || 0);
  const network = chainNameFromId(chainId) || (chainId ? `Chain ${chainId}` : "Universal");

  // Token changes describe what moved in/out.
  const changes = raw?.tokenChanges?.decr ?? raw?.tokenChanges ?? [];
  const firstChange = Array.isArray(changes) ? changes[0] : undefined;
  const amountIn = Number(firstChange?.amountInUSD ?? raw?.amountInUSD ?? 0) || 0;
  const symbol = String(firstChange?.token?.symbol || firstChange?.token?.type || "");
  const amountNum = Number(firstChange?.amount ?? 0) || 0;

  const isReceive = amountIn > 0 && (raw?.receiveTokens?.length || firstChange?.amount > 0);
  const amount = amountNum
    ? `${isReceive ? "+" : ""}${amountNum.toFixed(4)} ${symbol}`
    : amountIn
      ? `${isReceive ? "+" : "-"}${formatUsdValue(amountIn)}`
      : "—";

  const reference = raw?.nativeTransaction?.transactionHash || raw?.transactionHash || raw?.hash;
  const refShort = reference ? `${String(reference).slice(0, 6)}…${String(reference).slice(-4)}` : id;

  return {
    id,
    title: isReceive ? "Received" : "Transaction",
    description: network,
    amount,
    time: relativeTime(raw?.createdAt || raw?.timestamp || raw?.time),
    status,
    network,
    reference: refShort,
    note: isReceive
      ? "Funds are available in your universal balance."
      : "Transfer confirmed on-chain via Particle Universal Account.",
    icon: isReceive ? "solar:wallet-money-bold" : "solar:transfer-horizontal-bold",
    tone: isReceive ? "green" : "blue",
  };
}

/**
 * Reads the user's REAL transaction history from the Particle Universal Account
 * SDK (`universalAccount.getTransactions`). Falls back to an empty list (not mock)
 * when the SDK is unavailable or returns nothing.
 */
export function useTransactions(limit = 20) {
  const { universalAccount } = useUniversalAccount();
  const [items, setItems] = React.useState<RealHistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!universalAccount) {
      setIsLoading(false);
      setError("Connect your wallet to load transaction history.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await universalAccount.getTransactions(1, limit);
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setItems(list.map(summarizeTransaction));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [universalAccount, limit]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { items, isLoading, error, reload: load };
}
