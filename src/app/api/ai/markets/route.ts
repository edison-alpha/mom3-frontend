import { NextResponse } from "next/server";

/** Proxy for the complete yield-market catalog on Particle-supported chains. */
export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const chainId = searchParams.get("chain_id") || searchParams.get("chainId") || undefined;
  const executionOnly = (searchParams.get("execution_only") || searchParams.get("executionOnly")) === "true";
  const protocol = searchParams.get("protocol") || undefined;
  const backendUrl = process.env.MOM3_BACKEND_URL || process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({ error: "Market catalog is not configured.", code: "MARKET_BACKEND_NOT_CONFIGURED", markets: [] }, { status: 503 });
  }

  try {
    const params = new URLSearchParams();
    if (chainId) params.set("chain_id", chainId);
    if (executionOnly) params.set("execution_only", "true");
    if (protocol) params.set("protocol", protocol);
    const databaseParams = new URLSearchParams(params);
    databaseParams.set("page", new URL(request.url).searchParams.get("page") || "1");
    databaseParams.set("limit", new URL(request.url).searchParams.get("limit") || "100");
    const response = await fetch(`${backendUrl}/api/markets?${databaseParams.toString()}`, { cache: "no-store" });
    const payload = await response.json();

    // Keep the AgentKit path available only for a missing PostgreSQL route.
    // Other failures must remain visible to the UI as errors.
    if (response.status === 404) {
      const legacyResponse = await fetch(`${backendUrl}/api/ai/markets?${params.toString()}`, { cache: "no-store" });
      const legacyPayload = await legacyResponse.json().catch(() => ({}));
      return NextResponse.json(legacyPayload, { status: legacyResponse.status });
    }

    // Keep the frontend compatible with an older backend process that only
    // exposes /api/yield-forecast. This can happen while the local service is
    // running from a previous checkout or before it has been restarted.
    if (response.status === 404) {
      const forecastResponse = await fetch(`${backendUrl}/api/ai/forecast?${params.toString()}`, {
        cache: "no-store",
      });
      const forecastPayload = await forecastResponse.json();
      if (forecastResponse.ok && Array.isArray(forecastPayload.forecasts)) {
        return NextResponse.json({
          timestamp: forecastPayload.timestamp ?? null,
          chain_id: forecastPayload.chain_id ?? chainId,
          markets: forecastPayload.forecasts.map((forecast: Record<string, unknown>) => ({
            pool_id: `forecast:${forecast.chain_id ?? "unknown"}:${forecast.protocol ?? "unknown"}`,
            protocol: forecast.protocol ?? "unknown",
            symbol: "Yield market",
            chain: forecast.chain ?? "Unknown",
            chain_id: forecast.chain_id ?? 0,
            apy: Number(forecast.current_apy ?? 0),
            apy_base: Number(forecast.current_apy ?? 0),
            apy_reward: 0,
            tvl: 0,
            stablecoin: false,
            exposure: null,
            impermanent_loss: null,
            source: "defillama-forecast",
            trend: forecast.trend ?? "stable",
          })),
        });
      }
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Agentkit markets proxy failed", error);
    return NextResponse.json({ error: "Market catalog is temporarily unavailable.", code: "MARKET_PROXY_UNAVAILABLE", markets: [] }, { status: 502 });
  }
}
