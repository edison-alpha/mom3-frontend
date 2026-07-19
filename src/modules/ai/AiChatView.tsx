"use client";

import Image from "next/image";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { MobileHeader, MobileShell } from "@/components/ui/mobile-shell";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { StrategyResponse } from "./components/StrategyResponse";
import type { AiStrategy } from "./types/ai.types";
import { StrategyModeCard } from "@/modules/dashboard/components/StrategyModeCard";
import { portfolioModes } from "@/modules/dashboard/constants/dashboard";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";

type RiskTolerance = "conservative" | "moderate" | "aggressive";
type AllocationPlan = {
  wallet_value_usd: number;
  reserve_pct: number;
  deployable_usd: number;
  reasoning: string;
  plans: Array<{ market_id: string; protocol: string; chain_id: number; asset: string; allocation_pct: number; amount_usd: number }>;
};

function SearchingStrategyOverlay() {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 px-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="strategy-search-title"
      aria-describedby="strategy-search-description"
    >
      <div className="w-full max-w-xs text-center" aria-live="polite" aria-busy="true">
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-[#3B33BD]/50 motion-safe:animate-ping motion-reduce:hidden" />
          <span className="absolute inset-4 rounded-full bg-[#3B33BD]/20 blur-xl motion-safe:animate-pulse" />
          <Image
            src="/caracter.png"
            alt=""
            width={128}
            height={69}
            priority
            className="relative h-auto w-32 motion-safe:animate-pulse"
          />
        </div>
        <h2 id="strategy-search-title" className="mt-6 text-xl font-black text-white">
          Searching strategies
        </h2>
        <p id="strategy-search-description" className="mt-2 text-sm font-medium leading-relaxed text-[#A7A7B7]">
          mom3 is comparing live APY, liquidity, and risk across supported protocols.
        </p>
        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-[#ccff00]/20 bg-[#ccff00]/10 px-3 py-2 text-xs font-black text-[#ccff00]">
          <AppIcon icon="solar:radar-2-bold" aria-hidden="true" width={16} height={16} />
          Live market analysis
        </div>
      </div>
    </div>
  );
}

export default function AiChatView() {
  const { accountInfo, primaryAssets } = useUniversalAccount();
  const [riskTolerance, setRiskTolerance] = React.useState<RiskTolerance>("moderate");
  const allocationMutation = useMutation<AllocationPlan, Error, void>({
    mutationKey: ["ai", "allocation-plan"],
    mutationFn: async () => {
      const walletAssets = (primaryAssets?.assets ?? []).flatMap((asset) =>
        (asset.chainAggregation ?? []).map((entry) => ({
          symbol: String(asset.tokenType || "UNKNOWN").toUpperCase(),
          balance: Number(entry.amount || 0),
          amount_in_usd: Number(entry.amountInUSD || 0),
          chain_id: Number(entry.token?.chainId || 0),
          chain: String(entry.token?.chainName || entry.token?.chainId || "Unknown chain"),
          token_address: String(entry.token?.address || ""),
        })),
      );
      const response = await fetch("/api/ai/allocation-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          risk_tolerance: riskTolerance,
          user_address: accountInfo.evmSmartAccount || accountInfo.solanaSmartAccount,
          wallet_assets: walletAssets,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.error || "Unable to allocate your balance.");
      return payload as AllocationPlan;
    },
  });
  const strategyMutation = useMutation<AiStrategy, Error, RiskTolerance>({
    mutationKey: ["ai", "strategy"],
    mutationFn: async (risk) => {
      const response = await fetch("/api/ai/strategy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ risk_tolerance: risk }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.error || "Unable to search strategies.");
      return payload as AiStrategy;
    },
  });
  const strategy = strategyMutation.data ?? null;
  const isSearching = strategyMutation.isPending;
  const error = strategyMutation.error?.message ?? null;

  React.useEffect(() => {
    const savedMode = window.localStorage.getItem("mom3-risk-tolerance");
    if (savedMode === "conservative" || savedMode === "moderate" || savedMode === "aggressive") {
      setRiskTolerance(savedMode);
    }
  }, []);

  const searchStrategies = React.useCallback(() => {
    if (!strategyMutation.isPending) strategyMutation.mutate(riskTolerance);
  }, [riskTolerance, strategyMutation]);

  return (
    <MobileShell contentClassName="pb-10 pt-20">
      <MobileHeader title="mom3 /agent" backHref="/dashboard" backLabel="Back to dashboard" />

      <StrategyModeCard
        activeModeIndex={riskTolerance === "aggressive" ? 0 : riskTolerance === "conservative" ? 2 : 1}
        activeMode={portfolioModes[riskTolerance === "aggressive" ? 0 : riskTolerance === "conservative" ? 2 : 1] ?? portfolioModes[1]}
        onSelectMode={(index) => {
          const nextRisk = index === 0 ? "aggressive" : index === 2 ? "conservative" : "moderate";
          setRiskTolerance(nextRisk);
          window.localStorage.setItem("mom3-risk-tolerance", nextRisk);
        }}
      />

      {!strategy && !error ? (
        <section className="flex min-h-[calc(100dvh-8rem)] items-center justify-center pb-10">
          <ChatEmptyState onGetStrategy={() => void searchStrategies()} />
        </section>
      ) : null}

      {error ? (
        <section className="mt-8 rounded-[24px] border border-red-400/20 bg-red-400/5 p-5 text-center" role="alert">
          <AppIcon icon="solar:danger-triangle-bold" aria-hidden="true" width={28} height={28} className="mx-auto text-[#FF7B7B]" />
          <h2 className="mt-3 text-base font-black text-white">Strategy search failed</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#A7A7B7]">{error}</p>
          <Button
            type="button"
            color="primary"
            rounded="full"
            label="Try again"
            className="mt-5"
            onClick={() => void searchStrategies()}
          />
        </section>
      ) : null}

      {strategy ? (
        <section className="mt-4 pb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#ccff00]">Analysis complete</p>
              <h1 className="mt-0.5 text-lg font-black text-white">Recommended strategies</h1>
            </div>
            <Button
              type="button"
              color="dark"
              size="compact"
              rounded="full"
              label="Refresh"
              startIcon="lucide:refresh-cw"
              onClick={() => void searchStrategies()}
            />
          </div>
          <div className="mb-4 rounded-[22px] border border-[#ccff00]/20 bg-[#ccff00]/[0.06] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">Auto allocation</p>
                <p className="mt-1 text-xs text-[#A7A7B7]">Use your live Universal Account balance.</p>
              </div>
              <Button
                type="button"
                color="primary"
                rounded="full"
                label={allocationMutation.isPending ? "Allocating..." : "Optimize balance"}
                disabled={allocationMutation.isPending || !primaryAssets}
                onClick={() => allocationMutation.mutate()}
              />
            </div>
            {allocationMutation.error ? <p className="mt-3 text-xs font-bold text-[#FF7B7B]" role="alert">{allocationMutation.error.message}</p> : null}
            {allocationMutation.data ? (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                <p className="text-xs font-bold text-[#A7A7B7]">Deploying ${allocationMutation.data.deployable_usd.toFixed(2)} · {allocationMutation.data.reserve_pct}% reserve</p>
                {allocationMutation.data.plans.map((plan) => (
                  <div key={`${plan.market_id}-${plan.chain_id}`} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2 text-xs">
                    <span className="min-w-0 truncate font-bold text-white">{plan.protocol} · {plan.asset}</span>
                    <span className="shrink-0 font-black text-[#ccff00]">${plan.amount_usd.toFixed(2)}</span>
                  </div>
                ))}
                {!allocationMutation.data.plans.length ? <p className="text-xs text-[#A7A7B7]">No executable allocation is available for the current balance.</p> : null}
              </div>
            ) : null}
          </div>
          <StrategyResponse strategy={strategy} />
        </section>
      ) : null}

      {isSearching ? <SearchingStrategyOverlay /> : null}
    </MobileShell>
  );
}
