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

type RiskTolerance = "conservative" | "moderate" | "aggressive";

const riskModes: Array<{ value: RiskTolerance; label: string; description: string }> = [
  { value: "conservative", label: "Safe", description: "Prioritize lower risk" },
  { value: "moderate", label: "Balanced", description: "Balance risk and APY" },
  { value: "aggressive", label: "Degen", description: "Prioritize higher APY" },
];

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
  const [riskTolerance, setRiskTolerance] = React.useState<RiskTolerance>("moderate");
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

      <section className="mt-4 rounded-[24px] border border-white/10 bg-[#111217] p-4" aria-labelledby="risk-mode-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="risk-mode-title" className="text-sm font-black text-white">Strategy mode</p>
            <p className="mt-1 text-xs font-medium text-[#A7A7B7]">AI will search markets using this risk profile.</p>
          </div>
          <AppIcon icon="solar:tuning-2-bold" aria-hidden="true" width={20} height={20} className="text-[#ccff00]" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Strategy risk mode">
          {riskModes.map((mode) => {
            const active = riskTolerance === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setRiskTolerance(mode.value);
                  window.localStorage.setItem("mom3-risk-tolerance", mode.value);
                }}
                className={`rounded-2xl border px-2 py-3 text-center transition-colors ${active ? "border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]" : "border-white/10 bg-black/20 text-[#A7A7B7]"}`}
              >
                <span className="block text-xs font-black">{mode.label}</span>
                <span className="mt-1 block text-[10px] font-medium leading-tight">{mode.description}</span>
              </button>
            );
          })}
        </div>
      </section>

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
          <StrategyResponse strategy={strategy} />
        </section>
      ) : null}

      {isSearching ? <SearchingStrategyOverlay /> : null}
    </MobileShell>
  );
}
