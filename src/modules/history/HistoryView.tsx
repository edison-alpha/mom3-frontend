"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { FloatingMenuButton } from "@/components/ui/menu-button";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { historyItems, type HistoryItem } from "@/lib/history";
import { useTransactions, type RealHistoryItem } from "./hooks/useTransactions";
import { cn } from "@/lib/utils";

const toneClassName: Record<HistoryItem["tone"], string> = {
  green: "bg-[#ccff00] text-[#0a0a0a]",
  purple: "bg-[#3B33BD] text-white",
  blue: "bg-[#2d2eff] text-white",
};

export default function HistoryView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const { items: realItems, isLoading, error } = useTransactions();

  // Real on-chain transactions replace the mock "me" list.
  const myHistoryItems: RealHistoryItem[] = realItems;
  const networkOptions = React.useMemo(
    () => ["all", ...Array.from(new Set(myHistoryItems.map((item) => item.network)))],
    [myHistoryItems],
  );
  const networkParam = searchParams.get("network") ?? "all";
  const selectedNetwork = networkOptions.includes(networkParam) ? networkParam : "all";
  const activeItems = React.useMemo(
    () =>
      selectedNetwork === "all"
        ? myHistoryItems
        : myHistoryItems.filter((item) => item.network === selectedNetwork),
    [myHistoryItems, selectedNetwork],
  );

  const selectNetwork = (network: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (network === "all") {
      params.delete("network");
    } else {
      params.set("network", network);
    }

    const query = params.toString();
    router.replace(query ? `/history?${query}` : "/history");
    setFilterSheetOpen(false);
  };

  const selectedNetworkLabel =
    selectedNetwork === "all" ? "Semua" : selectedNetwork;

  const networkHeaderAction = (
    <Button
      type="button"
      onClick={() => setFilterSheetOpen(true)}
      color="dark"
      size="icon"
      rounded="full"
      startIcon="solar:global-bold"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
      aria-label="Filter by network"
      aria-expanded={filterSheetOpen}
      aria-haspopup="dialog"
    />
  );

  return (
    <MobileShell bottomSlot={<FloatingMenuButton activeHref="/history" />}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <MobilePageHeader title="History" action={networkHeaderAction} />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative mt-5 flex items-center gap-2"
        >
          <Button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            color="dark"
            size="compact"
            rounded="full"
            className="flex h-9 max-w-36 items-center gap-1.5 rounded-full bg-[#1C1C1E] px-3 text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            aria-label="Filter by network"
            aria-expanded={filterSheetOpen}
            aria-haspopup="dialog"
          >
            <span className="truncate text-xs font-black">
              {selectedNetworkLabel}
            </span>
            <AppIcon
              icon="lucide:chevron-down"
              aria-hidden="true"
              width={14}
              height={14}
              className={cn(
                "shrink-0 text-[#77777f] transition-transform",
                filterSheetOpen && "rotate-180",
              )}
            />
          </Button>

          <Button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            color="dark"
            size="icon-sm"
            rounded="full"
            startIcon="lucide:sliders-horizontal"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1C1E] text-[#77777f] transition-colors hover:bg-[#262628] hover:text-white focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            aria-label="Open history filters"
            aria-expanded={filterSheetOpen}
            aria-haspopup="dialog"
          />
        </motion.section>

        <section className="mt-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                My history
              </h2>
              <p className="mt-1 text-sm font-medium text-[#9A9AA2]">
                Recent activity from your wallet.
              </p>
            </div>
            <span className="rounded-full bg-[#1C1C1E] px-3 py-1 text-xs font-bold text-[#9A9AA2]">
              {activeItems.length} item
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNetwork}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {isLoading ? (
                <div className="mt-4 flex min-h-48 flex-col items-center justify-center rounded-[28px] bg-[#1C1C1E] px-6 text-center">
                  <AppIcon
                    icon="lucide:loader-circle"
                    aria-hidden="true"
                    width={32}
                    height={32}
                    className="animate-spin text-[#9A9AA2]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#9A9AA2]">Loading on-chain history…</p>
                </div>
              ) : error ? (
                <div className="mt-4 flex min-h-48 flex-col items-center justify-center rounded-[28px] bg-[#1C1C1E] px-6 text-center">
                  <AppIcon
                    icon="solar:danger-triangle-bold"
                    aria-hidden="true"
                    width={32}
                    height={32}
                    className="text-[#FF7B7B]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#A7A7B7]">{error}</p>
                </div>
              ) : activeItems.length > 0 ? (
                <div className="mt-4 overflow-hidden rounded-[28px] bg-[#1C1C1E]">
                  {activeItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/history/${item.id}`}
                        className={cn(
                          "flex min-h-[78px] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
                          index < activeItems.length - 1 && "border-b border-white/5"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                            toneClassName[item.tone]
                          )}
                        >
                          <AppIcon
                            icon={item.icon}
                            aria-hidden="true"
                            width={22}
                            height={22}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-bold text-white">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block truncate text-sm font-medium text-[#9A9AA2]">
                            {item.description}
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-2 text-right">
                          <span>
                            <span className="block text-sm font-bold text-white">
                              {item.amount}
                            </span>
                            <span className="mt-0.5 block text-xs font-semibold text-[#77777f]">
                              {item.time}
                            </span>
                          </span>
                          <AppIcon
                            icon="lucide:chevron-right"
                            aria-hidden="true"
                            width={18}
                            height={18}
                            className="text-[#66666D]"
                          />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 flex min-h-48 flex-col items-center justify-center rounded-[28px] bg-[#1C1C1E] px-6 text-center"
                >
                  <AppIcon
                    icon="material-symbols:history-2"
                    aria-hidden="true"
                    width={36}
                    height={36}
                    className="text-[#9A9AA2]"
                  />
                  <p className="mt-3 text-base font-bold text-white">
                    No history yet
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#9A9AA2]">
                    New activity will appear here.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        <BottomSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          title="Filter"
          description="Pilih jaringan untuk history wallet kamu."
          closeLabel="Close history filters"
          contentClassName="space-y-2"
        >
          {networkOptions.map((network) => {
            const isActive = network === selectedNetwork;
            const label = network === "all" ? "Semua" : network;

            return (
              <Button
                key={network}
                type="button"
                onClick={() => selectNetwork(network)}
                variant="plain"
                size="lg"
                rounded="lg"
                className={cn(
                  "flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl px-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
                  isActive
                    ? "bg-[#3B33BD] text-[#ccff00]"
                    : "bg-black/25 text-white hover:bg-white/[0.04]",
                )}
              >
                <span className="min-w-0 flex items-center gap-3">
                  <AppIcon
                    icon={network === "all" ? "solar:global-bold" : "lucide:network"}
                    aria-hidden="true"
                    width={19}
                    height={19}
                    className="shrink-0"
                  />
                  <span className="truncate text-sm font-bold">{label}</span>
                </span>
                {isActive ? (
                  <AppIcon
                    icon="material-symbols:check-rounded"
                    aria-hidden="true"
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                ) : null}
              </Button>
            );
          })}
        </BottomSheet>
    </MobileShell>
  );
}
