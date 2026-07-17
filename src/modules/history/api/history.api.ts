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
  const response = await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account, transactions }),
    cache: "no-store",
  });
  if (!response.ok) return false;
  return true;
}
