import type { MarketAnalysisPage, MarketAnalysisPageParams } from "../types/market-analysis.types";

export function getMarketAnalysisPage(params: MarketAnalysisPageParams = {}) {
  const query = new URLSearchParams({ page: String(params.page || 1), page_size: String(Math.min(10, params.pageSize || 10)) });
  if (params.chainId) query.set("chain_id", String(params.chainId));
  if (params.riskTolerance) query.set("risk_tolerance", params.riskTolerance);
  return fetch(`/api/ai/market-analysis?${query}`, { cache: "no-store" }).then(async (response) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || payload.detail || "AI market analysis is unavailable.");
    return payload as MarketAnalysisPage;
  });
}
