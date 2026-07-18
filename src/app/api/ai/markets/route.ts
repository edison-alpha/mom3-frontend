import { NextResponse } from "next/server";

/** Public FE proxy. The backend is the only market data source. */
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
    databaseParams.set("limit", new URL(request.url).searchParams.get("limit") || "50");
    const limitPerProtocol = searchParams.get("limit_per_protocol");
    if (limitPerProtocol) databaseParams.set("limit_per_protocol", limitPerProtocol);
    const response = await fetch(`${backendUrl}/api/markets?${databaseParams.toString()}`, { cache: "no-store" });
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Agentkit markets proxy failed", error);
    return NextResponse.json({ error: "Market catalog is temporarily unavailable.", code: "MARKET_PROXY_UNAVAILABLE", markets: [] }, { status: 502 });
  }
}
