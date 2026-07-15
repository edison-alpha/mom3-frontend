import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";

import { DEFAULT_AAVE_CHAIN_ID, getAaveMarketConfig, AAVE_POOL_ABI, ERC20_APPROVAL_ABI } from "@/modules/explore/constants/aave.constants";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const RAY = BigInt(10) ** BigInt(27);
const SECONDS_PER_YEAR = 31_536_000;

function rayAprToApy(rate: bigint) {
  const apr = Number(rate) / Number(RAY);
  return (Math.pow(1 + apr / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1) * 100;
}

function asNumber(value: bigint, decimals = 6) {
  return Number(formatUnits(value, decimals));
}

async function readHistoricalChart(market: NonNullable<ReturnType<typeof getAaveMarketConfig>>) {
  const apiKey = process.env.AAVESCAN_API_KEY;
  if (!apiKey) return null;
  try {
    const params = new URLSearchParams({
      market: market.historySlug,
      reserveAddress: market.usdc,
      apiKey,
    });
    const response = await fetch(`https://api.aavescan.com/v2/csv?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const rows = await response.json() as Array<{ supplyApr?: number }>;
    const values = rows
      .map((row) => Number(row.supplyApr) * 100)
      .filter((value) => Number.isFinite(value));
    if (values.length < 2) return null;

    const slice = (size: number) => values.slice(-size).map((value, index, current) =>
      current.length === 1 ? value : value + (values.at(-1)! - value) * (index / (current.length - 1)),
    );
    return { "1D": slice(2), "1W": slice(7), "1M": slice(30), "1Y": slice(365) };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
    if (backendUrl) {
      const incoming = new URL(request.url);
      const upstream = new URL("/api/market/aave", backendUrl);
      incoming.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));
      const backendResponse = await fetch(upstream, { cache: "no-store" });
      const payload = await backendResponse.json();
      if (backendResponse.ok && payload?.success && payload.data) {
        return NextResponse.json(payload.data);
      }
    }
    const account = new URL(request.url).searchParams.get("account");
    const requestedChainId = Number(new URL(request.url).searchParams.get("chainId") || DEFAULT_AAVE_CHAIN_ID);
    const market = getAaveMarketConfig(requestedChainId);
    if (!market) return NextResponse.json({ error: `Aave market is not configured for chain ${requestedChainId}.` }, { status: 404 });
    const provider = new JsonRpcProvider(
      process.env[`AAVE_RPC_${market.chainId}`] || market.rpcUrl,
    );
    const pool = new Contract(market.pool, AAVE_POOL_ABI, provider);
    const usdc = new Contract(market.usdc, ERC20_APPROVAL_ABI, provider);
    const reserve = await pool.getReserveData(market.usdc);
    const [availableLiquidity, variableDebt, userUsdcBalance, historicalChart] = await Promise.all([
      usdc.balanceOf(market.pool),
      reserve.variableDebtTokenAddress === "0x0000000000000000000000000000000000000000"
        ? BigInt(0)
        : new Contract(reserve.variableDebtTokenAddress, ERC20_APPROVAL_ABI, provider).balanceOf(market.pool),
      account ? usdc.balanceOf(account) : Promise.resolve(BigInt(0)),
      readHistoricalChart(market),
    ]);
    const userATokenBalance = account
      ? await new Contract(reserve.aTokenAddress, ERC20_APPROVAL_ABI, provider).balanceOf(account)
      : BigInt(0);
    const supplied = availableLiquidity + variableDebt;
    const utilization = supplied > BigInt(0) ? Number((variableDebt * BigInt(10_000)) / supplied) / 100 : 0;
    const apy = rayAprToApy(BigInt(reserve.currentLiquidityRate.toString()));

    return NextResponse.json({
      chainId: market.chainId,
      network: market.network,
      asset: "USDC",
      protocol: "Aave v3",
      source: "aave-pool-onchain",
      lastUpdated: new Date().toISOString(),
      apy,
      tvl: asNumber(supplied),
      utilization,
      aTokenAddress: reserve.aTokenAddress,
      wallet: {
        usdc: asNumber(userUsdcBalance),
        aUsdc: asNumber(userATokenBalance),
      },
      chart: {
        "1D": historicalChart?.["1D"] || [apy, apy],
        "1W": historicalChart?.["1W"] || [apy, apy],
        "1M": historicalChart?.["1M"] || [apy, apy],
        "1Y": historicalChart?.["1Y"] || [apy, apy],
      },
    });
  } catch (error) {
    console.error("Aave market reader failed", error);
    return NextResponse.json({ error: "Aave market data is temporarily unavailable." }, { status: 502 });
  }
}
