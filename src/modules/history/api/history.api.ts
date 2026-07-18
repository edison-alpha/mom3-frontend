export type HistoryPerformance = {
  window: "24h";
  net_usd: number;
  change_percent: number;
  activity_count: number;
  has_real_data: boolean;
  generated_at: string;
};

export async function getHistoryPerformance(account: string, totalValue: number) {
  const params = new URLSearchParams({ account, total_value: String(totalValue) });
  const response = await fetch(`/api/history/summary?${params}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Unable to load portfolio performance.");
  return payload.data as HistoryPerformance;
}

export async function syncHistory(account: string, transactions: unknown[]) {
  const response = await fetch("/api/history/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account, transactions }),
    cache: "no-store",
  });
  if (!response.ok) return false;
  return true;
}

export async function getHistoryTransactions(account: string, limit = 50, cursor?: string) {
  const params = new URLSearchParams({ account, limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const response = await fetch(`/api/history/transactions?${params}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Unable to load transaction history.");
  return payload as { items: StoredHistoryTransaction[]; nextCursor: string | null };
}
export type HistoryStatus = "pending" | "success" | "failed";

export type StoredHistoryTransaction = {
  transactionId: string;
  activityType: string;
  action: string;
  title: string;
  description: string;
  note: string;
  status: HistoryStatus;
  statusCode?: number | null;
  chainId: number;
  network: string;
  protocol?: string | null;
  amount: { value: number; symbol: string; usd: number; direction: "in" | "out" | "neutral" };
  transactionHash?: string | null;
  explorerUrl?: string | null;
  occurredAt: string;
};
