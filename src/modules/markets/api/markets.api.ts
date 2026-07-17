export type MarketListParams = {
  page?: number;
  limit?: number;
  chainId?: number;
  protocol?: string;
  executionOnly?: boolean;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: "no-store", ...init });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.error || "Market data is unavailable.");
  return payload as T;
}

export function getMarkets(params: MarketListParams = {}) {
  const query = new URLSearchParams({ page: String(params.page || 1), limit: String(params.limit || 100) });
  if (params.chainId) query.set("chain_id", String(params.chainId));
  if (params.protocol && params.protocol !== "all") query.set("protocol", params.protocol);
  if (params.executionOnly) query.set("execution_only", "true");
  return apiFetch<{ markets?: unknown[] }>(`/api/ai/markets?${query}`);
}

export function getMarketDetail(marketId: string) {
  return apiFetch<{ market?: any; chart?: Array<{ timestamp?: string; apy?: number; tvlUsd?: number }>; timestamp?: string }>(`/api/ai/markets/${encodeURIComponent(marketId)}`);
}
