import { motion } from "framer-motion";
import { AppIcon } from "@/components/ui/app-icon";
import { Typography } from "@/components/ui/typography";

import { portfolioModes } from "../constants/dashboard";
import type { PortfolioMode } from "../types/dashboard.types";
import { cn } from "@/lib/utils";
import { DegenDogeIcon } from "./DegenDogeIcon";

type StrategyModeCardProps = {
  activeMode: PortfolioMode;
  activeModeIndex: number;
  onSelectMode: (index: number) => void;
  compact?: boolean;
};

export function StrategyModeCard({
  activeMode,
  activeModeIndex,
  onSelectMode,
  compact = false,
}: StrategyModeCardProps) {
  return (
    <section className={cn("mt-4 rounded-[22px] border border-white/10 bg-[#1C1C1E] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]", compact && "mt-3 p-2.5")}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Typography as="h2" variant="h4">Strategy mode</Typography>
          <Typography variant="caption" color="muted" className="mt-0.5">
            Pick how aggressive mom3 should be.
          </Typography>
        </div>
        <span className="shrink-0 rounded-full bg-[#3B33BD]/20 px-2.5 py-1 text-[11px] font-black text-[#ccff00]">
          {activeMode.metric}
        </span>
      </div>

      <div className={cn("mt-2.5 grid grid-cols-3 gap-1.5", compact && "mt-2")}>
        {portfolioModes.map((mode, index) => {
          const isActive = index === activeModeIndex;

          return (
            <motion.button
              key={mode.label}
              type="button"
              onClick={() => onSelectMode(index)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "flex h-10 min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full px-1 text-[11px] font-black transition-all duration-500 focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
                isActive
                  ? "scale-[1.02] bg-[#3B33BD] text-[#ccff00] shadow-[0_10px_24px_-16px_rgba(59,51,189,0.9)]"
                  : "bg-[#111113] text-[#8E8E98] hover:bg-white/5 hover:text-white",
              )}
            >
              {mode.icon === "degen-doge" ? (
                <DegenDogeIcon className="h-4 w-4" />
              ) : (
                <AppIcon icon={mode.icon} aria-hidden="true" width={14} height={14} />
              )}
              <span className="truncate">{mode.label}</span>
            </motion.button>
          );
        })}
      </div>

      {!compact ? <motion.div
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mt-2.5 rounded-[18px] border border-white/10 bg-[linear-gradient(115deg,#17181d_0%,#111216_100%)] p-2.5"
      >
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B33BD]/20 text-[#ccff00]">
            {activeMode.icon === "degen-doge" ? (
              <DegenDogeIcon className="h-7 w-7" />
            ) : (
              <AppIcon icon={activeMode.icon} aria-hidden="true" width={19} height={19} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <Typography as="span" variant="h4" truncate>
              {activeMode.title}
            </Typography>
            <Typography as="span" variant="caption" color="muted" className="mt-0.5 block">
              {activeMode.description}
            </Typography>
          </span>
          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-[#9A9AA2]">
            {activeMode.tone}
          </span>
        </div>
      </motion.div> : null}
    </section>
  );
}
