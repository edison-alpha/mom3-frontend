export type MarketListParams = {
  page?: number;
  limit?: number;
  chainId?: number;
  protocol?: string;
  executionOnly?: boolean;
  limitPerProtocol?: number;
};

export type MarketListResponse = {
  timestamp?: string | null;
  data_source?: string;
  markets?: unknown[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
  };
  grouped?: boolean;
  protocol_totals?: Record<string, number> | null;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: "no-store", ...init });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.detail || "Market catalog is temporarily unavailable.");
  }
  return payload as T;
}

export function getMarkets(params: MarketListParams = {}) {
  const query = new URLSearchParams({ page: String(params.page || 1), limit: String(params.limit || 50) });
  if (params.chainId) {
    // Send both spellings while older Vercel workers drain; the backend
    // contract remains snake_case.
    query.set("chain_id", String(params.chainId));
    query.set("chainId", String(params.chainId));
  }
  if (params.protocol && params.protocol !== "all") query.set("protocol", params.protocol);
  if (params.executionOnly) query.set("execution_only", "true");
  if (params.limitPerProtocol) query.set("limit_per_protocol", String(params.limitPerProtocol));
  return apiFetch<MarketListResponse>(`/api/ai/markets?${query}`);
}

export function getMarketDetail(marketId: string) {
  return apiFetch<{ market?: any; chart?: Array<{ timestamp?: string; apy?: number; tvlUsd?: number }>; timestamp?: string }>(`/api/ai/markets/${encodeURIComponent(marketId)}`);
}
