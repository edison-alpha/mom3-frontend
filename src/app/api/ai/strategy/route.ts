import { NextResponse } from "next/server";

type RiskTolerance = "conservative" | "moderate" | "aggressive";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function linearSlope(values: number[]) {
  if (values.length < 2) return 0;
  const xMean = (values.length - 1) / 2;
  const yMean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const numerator = values.reduce((sum, value, index) => sum + (index - xMean) * (value - yMean), 0);
  const denominator = values.reduce((sum, _, index) => sum + (index - xMean) ** 2, 0);
  return denominator ? numerator / denominator : 0;
}

function forecast(values: number[], current: number) {
  const slope = linearSlope(values);
  return Array.from({ length: 7 }, (_, index) => Number(Math.max(0, current + slope * (index + 1)).toFixed(2)));
}

function getTrend(current: number, projected: number) {
  const delta = current ? ((projected - current) / current) * 100 : 0;
  return delta > 5 ? "rising" : delta < -5 ? "declining" : "stable";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (process.env.MOM3_AGENTKIT_URL) {
      const agentResponse = await fetch(`${process.env.MOM3_AGENTKIT_URL}/api/ai/strategy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const responseText = await agentResponse.text();
      let agentPayload: unknown;
      try {
        agentPayload = responseText ? JSON.parse(responseText) : {};
      } catch {
        agentPayload = {
          error: agentResponse.ok
            ? "Agentkit returned an invalid JSON response."
            : `Agentkit strategy failed (${agentResponse.status}).`,
        };
      }
      return NextResponse.json(agentPayload, { status: agentResponse.status });
    }
    const riskTolerance: RiskTolerance = ["conservative", "moderate", "aggressive"].includes(body.risk_tolerance)
      ? body.risk_tolerance
      : "moderate";
    const marketUrl = new URL("/api/aave/market", request.url);
    if (typeof body.chain_id === "number" || typeof body.chainId === "number") {
      marketUrl.searchParams.set("chainId", String(body.chain_id ?? body.chainId));
    }
    const marketResponse = await fetch(marketUrl, { cache: "no-store" });
    const market = await marketResponse.json();
    if (!marketResponse.ok) {
      return NextResponse.json({ error: market.error || "Aave market unavailable." }, { status: 502 });
    }

    const currentApy = Number(market.apy || 0);
    const weekly = Array.isArray(market.chart?.["1W"]) ? market.chart["1W"] : [currentApy];
    const forecast7d = forecast(weekly, currentApy);
    const slope = linearSlope(weekly);
    const trend = getTrend(currentApy, forecast7d.at(-1) ?? currentApy);
    const utilization = Number(market.utilization || 0);
    const riskScore = Number(clamp(2 + utilization / 20 + Math.abs(slope) * 2, 1, 10).toFixed(1));
    const healthScore = Math.round(clamp(100 - riskScore * 7 - Math.max(0, utilization - 80) * 0.5, 0, 100));
    const confidence = Number(clamp(0.55 + Math.min(weekly.length, 30) / 100, 0.55, 0.9).toFixed(2));
    const pulseScore = Number(clamp(100 - Math.max(0, utilization - 65) * 1.4 - Math.abs(slope) * 8, 0, 100).toFixed(1));

    return NextResponse.json({
      strategy_id: `aave-arbitrum-${Date.now()}`,
      network: "Arbitrum One",
      protocol: "Aave V3",
      asset: "USDC",
      risk_tolerance: riskTolerance,
      allocations: { "Aave V3 USDC": 100 },
      chain_allocations: [{
        protocol: "Aave V3",
        chain_id: Number(market.chainId || 42161),
        allocation: 100,
        expected_apy: Number(currentApy.toFixed(2)),
        risk_score: riskScore,
      }],
      opportunities: [{
        protocol: "Aave V3",
        pool: "USDC supply",
        pool_id: null,
        asset: "USDC",
        chain: market.network || "Arbitrum One",
        chain_id: Number(market.chainId || 42161),
        allocation: 100,
        apy: Number(currentApy.toFixed(2)),
        apy_base: Number(currentApy.toFixed(2)),
        apy_reward: 0,
        apy_change_1d: null,
        tvl: Number(market.tvl || 0),
        utilization,
        risk_score: riskScore,
        source: market.source,
        forecast: { current_apy: currentApy, forecast_7d: forecast7d, trend, confidence },
        liquidity_pulse: {
          protocol: "Aave V3",
          pulse_score: pulseScore,
          status: pulseScore >= 65 ? "Healthy" : pulseScore >= 40 ? "Watch" : "Caution",
          tvl: Number(market.tvl || 0),
          tvl_change_24h: 0,
          net_flow: "$0",
          timestamp: market.lastUpdated,
        },
      }],
      expected_apy: Number(currentApy.toFixed(2)),
      risk_score: riskScore,
      health_score: healthScore,
      diversification_score: 0,
      reasoning: `Aave V3 USDC currently offers ${currentApy.toFixed(2)}% APY with ${utilization.toFixed(0)}% utilization. The recommendation is based on live Arbitrum data and remains non-custodial; execution requires your confirmation.`,
      forecast: { current_apy: currentApy, forecast_7d: forecast7d, trend, slope: Number(slope.toFixed(4)), confidence },
      liquidity_pulse: { score: pulseScore, status: pulseScore >= 65 ? "Healthy" : pulseScore >= 40 ? "Watch" : "Caution", utilization },
      live_data_source: market.source,
      last_updated: market.lastUpdated,
    });
  } catch (error) {
    console.error("AI strategy generation failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? `AI strategy service unavailable: ${error.message}`
          : "AI strategy service is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
