"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { formatTokenBalance } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AssetVisibilityControls } from "@/modules/assets/types/portfolio.types";

function Toggle({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111217] motion-reduce:transition-none",
        checked ? "bg-[#ccff00]" : "bg-white/10",
      )}
    >
      <span
        className={cn(
          "block h-6 w-6 rounded-full shadow-sm transition-transform motion-reduce:transition-none",
          checked ? "translate-x-6 bg-[#16162a]" : "translate-x-0 bg-[#8F89FF]",
        )}
      />
    </button>
  );
}

export function AssetVisibilitySheet({
  open,
  onOpenChange,
  controls,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controls: AssetVisibilityControls;
}) {
  const visibleCount = controls.allTokens.filter((token) => !controls.hiddenAssetIds.has(token.id)).length;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Visible assets"
      description="Choose which tokens appear in My Assets. These settings stay on this device."
      closeLabel="Close asset visibility settings"
      className="max-h-[90vh]"
      footer={
        <Button
          type="button"
          color="dark"
          size="lg"
          rounded="full"
          fullWidth
          label="Show all tokens"
          onClick={controls.showAllAssets}
          disabled={controls.hiddenAssetIds.size === 0}
        />
      }
    >
      <div className="flex min-h-[64px] items-center gap-3 rounded-2xl bg-[#1C1C1E] px-3.5 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3B33BD]/25 text-[#8F89FF]">
          <AppIcon icon="lucide:eye-off" aria-hidden="true" width={20} height={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-white">Hide zero balances</span>
          <span className="mt-0.5 block text-xs font-medium text-[#A7A7B7]">Keep empty tokens out of the main list.</span>
        </span>
        <Toggle
          checked={controls.hideZeroBalances}
          onClick={() => controls.setHideZeroBalances(!controls.hideZeroBalances)}
          label="Hide tokens with zero balance"
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#8F8F96]">Tokens</p>
        <p className="text-xs font-bold text-[#A7A7B7]">{visibleCount} of {controls.allTokens.length} selected</p>
      </div>

      <div className="mt-2 overflow-hidden rounded-[22px] bg-black/25">
        {controls.allTokens.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <AppIcon icon="solar:wallet-bold" aria-hidden="true" width={28} height={28} className="mx-auto text-[#8F89FF]" />
            <p className="mt-2 text-sm font-black text-white">No tokens available</p>
            <p className="mt-1 text-xs font-medium text-[#A7A7B7]">Deposit an asset, then return here to manage it.</p>
          </div>
        ) : controls.allTokens.map((token) => {
          const selected = !controls.hiddenAssetIds.has(token.id);
          const isZero = token.balance <= 0 && token.amountInUSD <= 0;
          return (
            <button
              key={token.id}
              type="button"
              aria-pressed={selected}
              onClick={() => controls.toggleAsset(token.id)}
              className="flex min-h-[68px] w-full items-center gap-3 border-b border-white/[0.06] px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B33BD]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                <AppIcon icon={token.icon} aria-hidden="true" width={26} height={26} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-white">{token.name}</span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-[#9A9AA2]">
                  {formatTokenBalance(token.balance)} {token.symbol} · {token.chainName}
                </span>
              </span>
              {isZero ? <span className="text-[10px] font-black uppercase text-[#777780]">Zero</span> : null}
              <span className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                selected ? "bg-[#ccff00] text-black" : "bg-white/10 text-transparent",
              )}>
                <AppIcon icon="lucide:check" aria-hidden="true" width={16} height={16} />
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
