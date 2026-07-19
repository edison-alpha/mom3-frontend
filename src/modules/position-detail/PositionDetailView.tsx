"use client";

import { AppIcon } from "@/components/ui/app-icon";
import Link from "next/link";
import * as React from "react";

import { MiniChart, TimeRangeControl, type TimeRange } from "@/components/ui/mini-chart";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chainNameFromId } from "@/lib/chain";
import { formatTokenBalance, formatUsdValue } from "@/lib/format";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";

type Risk = "Low" | "Medium" | "High";

type LivePosition = {
  chainId: number;
  network: string;
  asset: string;
  protocol: string;
  apy: number;
  tvl: number;
  utilization: number;
  supplied: number; // aUSDC balance (the user's live supply position)
  walletUsdc: number;
  chart: Record<TimeRange, number[]>;
  source: string;
  lastUpdated: string;
};

function riskFromUtilization(utilization: number): Risk {
  if (utilization >= 90) return "High";
  if (utilization >= 70) return "Medium";
  return "Low";
}

function healthFromUtilization(utilization: number) {
  // Lower utilization = healthier lending pool. Cap 30..98.
  return Math.round(Math.max(30, Math.min(98, 98 - Math.max(0, utilization - 60) * 1.2)));
}

const riskClassName: Record<Risk, string> = {
  Low: "text-[#ccff00]",
  Medium: "text-[#FFD166]",
  High: "text-[#FF6B6B]",
};

/**
 * Position detail — REAL on-chain Aave V3 supply position for the connected
 * Universal Account. Reads /api/aave/market?account=<owner>&chainId=<chain> which
 * returns the live aUSDC (supplied) balance, APY, TVL and utilization.
 */
export default function PositionDetailView({ chainId }: { chainId?: number }) {
  const { accountInfo } = useUniversalAccount();
  const ownerAddress = accountInfo.ownerAddress;
  const targetChain = chainId ?? 42161;

  const [position, setPosition] = React.useState<LivePosition | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<TimeRange>("1W");

  const load = React.useCallback(async () => {
    if (!ownerAddress) {
      setIsLoading(false);
      setError("Connect your wallet to view your live position.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ chainId: String(targetChain), account: ownerAddress });
      const response = await fetch(`/api/aave/market?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Position unavailable.");
      setPosition({
        chainId: payload.chainId,
        network: payload.network,
        asset: payload.asset,
        protocol: payload.protocol,
        apy: Number(payload.apy || 0),
        tvl: Number(payload.tvl || 0),
        utilization: Number(payload.utilization || 0),
        supplied: Number(payload.wallet?.aUsdc || 0),
        walletUsdc: Number(payload.wallet?.usdc || 0),
        chart: payload.chart,
        source: payload.source,
        lastUpdated: payload.lastUpdated,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Position unavailable.");
    } finally {
      setIsLoading(false);
    }
  }, [ownerAddress, targetChain]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const risk = position ? riskFromUtilization(position.utilization) : "Low";
  const health = position ? healthFromUtilization(position.utilization) : 0;
  const tone = risk === "High" ? "red" : risk === "Medium" ? "yellow" : "green";
  const chartValues = position?.chart?.[range] ?? [0, 0];

  return (
    <MobileShell>
      <MobilePageHeader title="Position" backHref="/assets" backLabel="Back to assets" />

      {isLoading ? (
        <section className="mt-4 animate-pulse rounded-[24px] border border-white/10 bg-[#111217] p-5" aria-busy="true">
          <div className="h-12 w-12 rounded-full bg-white/10" />
          <div className="mt-4 h-8 w-2/3 rounded bg-white/10" />
          <div className="mt-3 h-24 rounded-2xl bg-white/10" />
        </section>
      ) : error ? (
        <section className="mt-4 rounded-[24px] border border-red-400/20 bg-red-400/5 p-5 text-center">
          <AppIcon icon="solar:danger-triangle-bold" aria-hidden="true" width={28} height={28} className="mx-auto text-[#FF7B7B]" />
          <p className="mt-3 text-sm font-medium text-[#A7A7B7]">{error}</p>
          <Button type="button" color="primary" rounded="full" label="Retry" className="mt-4" onClick={() => void load()} />
        </section>
      ) : position ? (
        <>
          <section className="mt-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(59,51,189,0.42),rgba(17,18,23,1)_46%)] p-3.5">
            <div className="flex items-start gap-3">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                <AppIcon icon="cryptocurrency-color:usdc" className="h-8 w-8" aria-hidden="true" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#111217] bg-black">
                  <AppIcon icon="simple-icons:aave" className="h-4 w-4 text-[#B650F2]" aria-hidden="true" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-black text-white">
                    {position.asset} / {position.protocol}
                  </h2>
                  <span className="rounded-full border border-[#ccff00]/25 bg-[#ccff00]/10 px-2 py-0.5 text-[10px] font-black text-[#ccff00]">
                    Yield
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#A7A7B7]">
                  Live supply position on {position.network} ({chainNameFromId(position.chainId)}).
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#A7A7B7]">Supplied (a{position.asset})</p>
                <p className="mt-1 text-3xl font-black text-white">
                  {formatTokenBalance(position.supplied)}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#A7A7B7]">
                  {formatUsdValue(position.supplied)} · wallet {formatTokenBalance(position.walletUsdc)} {position.asset}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#A7A7B7]">Health</p>
                <p className="mt-1 text-2xl font-black text-[#ccff00]">{health}</p>
              </div>
            </div>
          </section>

          <section className="mt-4">
            <TimeRangeControl value={range} onChange={setRange} />
            <MiniChart
              values={chartValues}
              label={`${position.protocol} APY trend`}
              tone={tone}
              range={range}
              defaultView="line"
              className="mt-3"
            />
          </section>

          <section className="mt-3 grid grid-cols-3 overflow-hidden rounded-[20px] border border-white/10 bg-[#111217]">
            {[
              ["Supply APY", `${position.apy.toFixed(2)}%`],
              ["Utilization", `${position.utilization.toFixed(0)}%`],
              ["Pool TVL", formatUsdValue(position.tvl)],
            ].map(([label, value], index) => (
              <div key={label} className={cn("p-2.5", index < 2 && "border-r border-white/10")}>
                <p className="text-xs font-medium text-[#A7A7B7]">{label}</p>
                <p className="mt-1.5 text-xs font-black text-white">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-3 grid grid-cols-3 overflow-hidden rounded-[20px] border border-white/10 bg-[#111217]">
            {[
              ["Risk", risk],
              ["Network", position.network],
              ["Source", "on-chain"],
            ].map(([label, value], index) => (
              <div key={label} className={cn("p-2.5", index < 2 && "border-r border-white/10")}>
                <p className="text-xs font-medium text-[#A7A7B7]">{label}</p>
                <p className={cn("mt-1.5 text-xs font-black", label === "Risk" ? riskClassName[risk] : "text-white")}>
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5">
            <h2 className="text-sm font-black text-white">Exposure</h2>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#A7A7B7]">
              You have {formatTokenBalance(position.supplied)} a{position.asset} supplied, earning {position.apy.toFixed(2)}% APY.
              Pool utilization is {position.utilization.toFixed(0)}%. AI recommends keeping this position active while
              health stays above 75 and reducing exposure if utilization spikes.
            </p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#777780]">
              Source: {position.source} · {new Date(position.lastUpdated).toLocaleString()}
            </p>
          </section>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/agent"
              className="flex h-12 items-center justify-center rounded-full bg-[#ccff00] text-sm font-black text-[#3B33BD] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/70"
            >
              Rebalance
            </Link>
            <Link
              href="/ai"
              className="flex h-12 items-center justify-center rounded-full bg-[#1C1C1E] text-sm font-black text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            >
              Ask Agent
            </Link>
          </div>
        </>
      ) : null}
    </MobileShell>
  );
}
