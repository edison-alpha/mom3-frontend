import { NextResponse } from "next/server";

/** Proxy for the complete yield-market catalog on Particle-supported chains. */
export async function GET(request: Request) {
  const chainId = new URL(request.url).searchParams.get("chainId") || undefined;
  const executionOnly = new URL(request.url).searchParams.get("executionOnly") === "true";
  const agentkitUrl = process.env.MOM3_AGENTKIT_URL;

  if (!agentkitUrl) {
    return NextResponse.json({ timestamp: null, chain_id: chainId, markets: [] });
  }

  try {
    const params = new URLSearchParams();
    if (chainId) params.set("chain_id", chainId);
    if (executionOnly) params.set("execution_only", "true");
    const response = await fetch(`${agentkitUrl}/api/yield-markets?${params.toString()}`, { cache: "no-store" });
    const payload = await response.json();

    // Keep the frontend compatible with an older Agentkit process that only
    // exposes /api/yield-forecast. This can happen while the local service is
    // running from a previous checkout or before it has been restarted.
    if (response.status === 404) {
      const forecastResponse = await fetch(`${agentkitUrl}/api/yield-forecast?${params.toString()}`, {
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
    return NextResponse.json({ timestamp: null, chain_id: chainId, markets: [] }, { status: 502 });
  }
}
