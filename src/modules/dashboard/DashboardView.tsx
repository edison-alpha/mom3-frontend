"use client";

import { motion } from "framer-motion";

import { FloatingMenuButton } from "@/components/ui/menu-button";
import { MobileShell } from "@/components/ui/mobile-shell";
import { useMagic } from "@/providers/magic/components/MagicProvider";
import { fadeUp } from "./constants/dashboard";
import { BalanceCard } from "./components/BalanceCard";
import { DashboardHeader } from "./components/DashboardHeader";
import { EarnSection } from "./components/EarnSection";
import { OpportunityGrid } from "./components/OpportunityGrid";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { useDashboardViewModel } from "./hooks/useDashboardViewModel";

export default function DashboardView() {
  const { isLoading: isMagicLoading, session } = useMagic();
  const {
    balanceDisplay,
    balanceHidden,
    balanceValue,
    currency,
    currencyOpen,
    hasAssets,
    isBalanceLoading,
    isInitialLoading,
    mounted,
    pnlDisplay,
    pnlValue,
    pnlPercent,
    username,
    isUsernameLoading,
    performanceHasRealData,
    isPerformanceLoading,
    handleSelectCurrency,
    handleToggleBalance,
    handleToggleCurrencyMenu,
  } = useDashboardViewModel();

  if (isMagicLoading || isInitialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <MobileShell bottomSlot={<FloatingMenuButton activeHref="/dashboard" />}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <DashboardHeader
            currency={currency}
            currencyOpen={currencyOpen}
            profileAddress={session?.ownerAddress}
            profileFallback={session?.email}
            username={username}
            isUsernameLoading={isUsernameLoading}
            onSelectCurrency={handleSelectCurrency}
            onToggleCurrencyMenu={handleToggleCurrencyMenu}
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        >
          <BalanceCard
            balanceDisplay={balanceDisplay}
            balanceHidden={balanceHidden}
            hasAssets={hasAssets}
            isBalanceLoading={isBalanceLoading}
            mounted={mounted}
            pnlDisplay={pnlDisplay}
            pnlValue={pnlValue}
            pnlPercent={pnlPercent}
            performanceHasRealData={performanceHasRealData}
            isPerformanceLoading={isPerformanceLoading}
            onToggleBalance={handleToggleBalance}
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
        >
          <OpportunityGrid />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.32, ease: "easeOut" }}
        >
          <EarnSection balanceLabel={balanceDisplay || String(balanceValue)} />
        </motion.div>
        <div className="flex-1" />
    </MobileShell>
  );
}
