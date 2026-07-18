"use client";

import * as React from "react";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { chainNameFromId } from "@/lib/chain";
import { formatUsdValue } from "@/lib/format";
import { syncHistory, type HistoryStatus } from "@/modules/history/api/history.api";

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
  activityType?: string;
  protocol?: string | null;
  transactionHash?: string | null;
  tokenSymbol?: string;
  action?: string;
  explorerUrl?: string | null;
};

function normalizeStatus(value: unknown): HistoryStatus {
  const text = String(value ?? "").toLowerCase();
  const numeric = Number(value);
  if ([6, 10, 14].includes(numeric)) return "failed";
  if ([7, 11].includes(numeric)) return "success";
  if (/fail|reject|cancel|error/.test(text)) return "failed";
  if (/success|finish|complete|confirm/.test(text)) return "success";
  return "pending";
}

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
  const status = normalizeStatus(raw?.status ?? raw?.transactionStatus);
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
    action: isReceive ? "receive" : "transaction",
    explorerUrl: `https://universalx.app/activity/details?id=${encodeURIComponent(id)}`,
  };
}

function mapStoredActivity(raw: any): RealHistoryItem {
  const amount = raw?.amount || {};
  const value = Number(amount.value || 0);
  const usd = Number(amount.usd || 0);
  const symbol = String(amount.symbol || "");
  const direction = amount.direction === "in" ? "+" : amount.direction === "out" ? "-" : "";
  return {
    id: String(raw.transactionId),
    title: String(raw.title || "Transaction"),
    description: String(raw.description || raw.network || "Universal"),
    amount: value ? `${direction}${value.toFixed(4)} ${symbol}`.trim() : usd ? `${direction}${formatUsdValue(usd)}` : "—",
    time: relativeTime(raw.occurredAt),
    status: normalizeStatus(raw.status),
    network: String(raw.network || "Universal"),
    reference: String(raw.reference || raw.transactionId),
    note: String(raw.note || "Transaction confirmed through Particle Universal Account."),
    icon: String(raw.icon || "solar:transfer-horizontal-bold"),
    tone: raw.tone === "green" || raw.tone === "purple" ? raw.tone : "blue",
    activityType: String(raw.activityType || "transaction"),
    protocol: raw.protocol || null,
    transactionHash: raw.transactionHash || null,
    tokenSymbol: symbol,
    action: String(raw.action || raw.activityType || "transaction"),
    explorerUrl: raw.explorerUrl || `https://universalx.app/activity/details?id=${encodeURIComponent(String(raw.transactionId))}`,
  };
}

/**
 * Reads the user's REAL transaction history from the Particle Universal Account
 * SDK (`universalAccount.getTransactions`). Falls back to an empty list (not mock)
 * when the SDK is unavailable or returns nothing.
 */
export function useTransactions(limit = 20) {
  const { universalAccount, accountInfo } = useUniversalAccount();
  const [items, setItems] = React.useState<RealHistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async (full = true) => {
    if (!universalAccount) {
      setIsLoading(false);
      setError("Connect your wallet to load transaction history.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const pageSize = full ? Math.max(limit, 50) : Math.max(limit, 20);
      const list: any[] = [];
      const maxPages = full ? 20 : 1;
      for (let page = 1; page <= maxPages; page += 1) {
        const response = await universalAccount.getTransactions(page, pageSize);
        const pageItems = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        list.push(...pageItems);
        if (pageItems.length < pageSize) break;
      }
      const account = accountInfo.evmSmartAccount || accountInfo.solanaSmartAccount || accountInfo.ownerAddress;
      if (account && list.length) {
        const synced = await syncHistory(account, list);
        if (synced) {
          const storedResponse = await fetch(`/api/history?account=${encodeURIComponent(account)}&limit=${Math.max(limit, 50)}`, { cache: "no-store" });
          const storedPayload = await storedResponse.json().catch(() => ({}));
          if (storedResponse.ok && Array.isArray(storedPayload?.items)) {
            setItems(storedPayload.items.map(mapStoredActivity));
            return;
          }
        }
      }
      setItems(list.map(summarizeTransaction));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [accountInfo.evmSmartAccount, accountInfo.ownerAddress, accountInfo.solanaSmartAccount, universalAccount, limit]);

  React.useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(false), 8_000);
    return () => window.clearInterval(timer);
  }, [load]);

  return { items, isLoading, error, reload: () => load(true) };
}
