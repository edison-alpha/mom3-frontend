import type { PortfolioAnalysisResponse } from "@/modules/assets/types/portfolio.types";

export async function analyzePortfolio(body: unknown) {
  const response = await fetch("/api/ai/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.error || "Portfolio analysis is unavailable.");
  return payload as PortfolioAnalysisResponse;
}
