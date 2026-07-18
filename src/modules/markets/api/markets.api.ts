import type { MarketAnalysisResponse } from "@/modules/explore/types/market-detail.types";

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

export type TopYieldResponse = {
  timestamp?: string;
  data_source?: string;
  analysis?: { engine?: string; scope?: string; market_count?: number; ranking?: string };
  markets?: unknown[];
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

export function getTopYields(params: { limit?: number; chainId?: number } = {}) {
  const query = new URLSearchParams({ limit: String(Math.min(10, Math.max(1, params.limit || 10))) });
  if (params.chainId) query.set("chain_id", String(params.chainId));
  return apiFetch<TopYieldResponse>(`/api/ai/top-yields?${query}`);
}

export function getMarketDetail(marketId: string) {
  return apiFetch<{ market?: unknown; timestamp?: string }>(`/api/ai/markets/${encodeURIComponent(marketId)}`);
}

export function getMarketAnalysis(marketId: string) {
  return apiFetch<MarketAnalysisResponse>(`/api/ai/markets/${encodeURIComponent(marketId)}/analysis`);
}

export function getMarketHistory(marketId: string, range = "30d") {
  return apiFetch<{ points?: Array<{ capturedAt?: string; timestamp?: string; apy?: number; tvlUsd?: number }> }>(
    `/api/ai/markets/${encodeURIComponent(marketId)}/chart?range=${encodeURIComponent(range)}`,
  );
}

export function getMarketMetrics(marketId: string) {
  return apiFetch<{ metrics?: Record<string, number | string | null> }>(
    `/api/ai/markets/${encodeURIComponent(marketId)}/metrics`,
  );
}
