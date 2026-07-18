"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import * as React from "react";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { historyTabs, type HistoryItem } from "@/lib/history";
import { cn } from "@/lib/utils";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";

function mapStoredActivity(raw: any): HistoryItem {
  const amount = raw?.amount || {};
  const value = Number(amount.value || 0);
  const usd = Number(amount.usd || 0);
  const direction = amount.direction === "in" ? "+" : amount.direction === "out" ? "-" : "";
  return {
    id: String(raw.transactionId),
    tab: "me",
    title: String(raw.title || "Transaction"),
    description: String(raw.description || raw.network || "Universal"),
    amount: value ? `${direction}${value.toFixed(4)} ${amount.symbol || ""}`.trim() : usd ? `${direction}$${usd.toFixed(2)}` : "—",
    time: raw.occurredAt ? new Date(raw.occurredAt).toLocaleString() : "Recently",
    status: String(raw.status || "Completed"),
    network: String(raw.network || "Universal"),
    reference: String(raw.reference || raw.transactionId),
    note: String(raw.note || "Your transaction was processed successfully."),
    icon: String(raw.icon || "solar:transfer-horizontal-bold"),
    tone: raw.tone === "green" || raw.tone === "purple" ? raw.tone : "blue",
    transactionHash: raw.transactionHash || null,
    tokenSymbol: amount.symbol || "",
    explorerUrl: raw.explorerUrl || `https://universalx.app/activity/details?id=${encodeURIComponent(String(raw.transactionId))}`,
  };
}

const toneClassName: Record<HistoryItem["tone"], string> = {
  green: "bg-[#ccff00] text-[#0a0a0a]",
  purple: "bg-[#3B33BD] text-white",
  blue: "bg-[#2d2eff] text-white",
};

export default function HistoryDetailView({ item, activityId }: { item?: HistoryItem; activityId?: string }) {
  const { accountInfo } = useUniversalAccount();
  const account = accountInfo.evmSmartAccount || accountInfo.solanaSmartAccount || accountInfo.ownerAddress;
  const detailQuery = useQuery({
    queryKey: ["history", "detail", activityId || null, account || null],
    enabled: !item && Boolean(activityId && account),
    queryFn: async () => {
      if (!activityId || !account) throw new Error("Connect your wallet to view this activity.");
      const response = await fetch(`/api/history/${encodeURIComponent(activityId)}?account=${encodeURIComponent(account)}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Activity not found.");
      return mapStoredActivity(payload.data);
    },
    staleTime: 60_000,
  });
  const liveItem = item || detailQuery.data || null;
  const isLoading = !item && detailQuery.isPending && Boolean(activityId && account);
  const error = !account && !item ? "Connect your wallet to view this activity." : detailQuery.error instanceof Error ? detailQuery.error.message : null;
  if (isLoading) return <MobileShell><MobilePageHeader title="Detail" backHref="/history" backLabel="Back to history" /><div className="mt-6 animate-pulse rounded-[28px] bg-[#1C1C1E] p-6"><div className="mx-auto h-16 w-16 rounded-full bg-white/10" /><div className="mx-auto mt-5 h-7 w-40 rounded bg-white/10" /><div className="mt-6 h-48 rounded-2xl bg-white/10" /></div></MobileShell>;
  if (error || !liveItem) return <MobileShell><MobilePageHeader title="Detail" backHref="/history" backLabel="Back to history" /><section className="mt-6 rounded-[24px] border border-red-400/20 bg-red-500/10 p-5 text-center" role="alert"><p className="text-sm font-black text-red-50">Could not load this activity</p><p className="mt-2 text-xs text-red-100/80">{error || "Activity not found."}</p></section></MobileShell>;

  const resolvedItem = liveItem;
  const tabLabel = historyTabs.find((tab) => tab.id === resolvedItem.tab)?.label;

  return (
    <MobileShell>
        <MobilePageHeader title="Detail" backHref="/history" backLabel="Back to history" />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-5 rounded-[32px] bg-[#1C1C1E] p-5 text-center"
        >
          <span
            className={cn(
              "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
              toneClassName[resolvedItem.tone]
            )}
          >
            <AppIcon icon={resolvedItem.icon} aria-hidden="true" width={30} height={30} />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#9A9AA2]">
            {tabLabel} history
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
            {resolvedItem.title}
          </h2>
          <p className="mt-2 text-sm font-medium text-[#9A9AA2]">
            {resolvedItem.note}
          </p>
          <p className="mt-5 text-3xl font-black text-white">{resolvedItem.amount}</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-5 overflow-hidden rounded-[28px] bg-[#1C1C1E]"
        >
          {[
            ["Status", resolvedItem.status],
            ["Network", resolvedItem.network],
            ["Reference", resolvedItem.reference],
            ["Time", resolvedItem.time],
          ].map(([label, value], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + index * 0.06 }}
              className={cn(
                "flex min-h-14 items-center justify-between gap-4 px-4 py-3",
                index < 3 && "border-b border-white/5"
              )}
            >
              <span className="text-sm font-medium text-[#9A9AA2]">{label}</span>
              <span className="min-w-0 truncate text-right text-sm font-bold text-white">
                {value}
              </span>
            </motion.div>
          ))}
          {resolvedItem.explorerUrl ? <a href={resolvedItem.explorerUrl} target="_blank" rel="noreferrer" className="flex min-h-14 items-center justify-between gap-4 border-t border-white/5 px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-[#ccff00]"><span className="text-[#9A9AA2]">View transaction details</span><span className="font-black text-[#ccff00]">Open ↗</span></a> : null}
        </motion.section>
    </MobileShell>
  );
}
