"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TokenAssetBadge } from "@/modules/send/components/TokenAssetBadge";
import type { TokenRow } from "@/modules/send/types/send.types";
import { formatTokenBalance, formatUsd } from "@/lib/format";

export function TokenRowItem({
  token,
  selected,
  onSelect,
}: {
  token: TokenRow;
  selected: boolean;
  onSelect: (token: TokenRow) => void;
}) {
  return (
    <Button
      type="button"
      onClick={() => onSelect(token)}
      variant="plain"
      size="lg"
      rounded="lg"
      className={cn(
        "flex min-h-[76px] w-full items-center gap-3 rounded-[24px] border border-white/5 bg-black/20 px-3 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
      )}
      aria-pressed={selected}
    >
      <TokenAssetBadge token={token} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-black leading-none text-white">{token.symbol}</span>
        <span className="mt-1 block truncate text-xs font-medium text-[#9A9AA2]">{token.chainName}</span>
      </span>

      <span className="shrink-0 text-right">
        <span className="block font-mono text-base font-black tabular-nums leading-none text-white">
          {formatTokenBalance(token.balance)}
        </span>
        <span className="mt-1 block font-mono text-xs font-medium tabular-nums text-[#9A9AA2]">
          {formatUsd(token.amountInUSD)}
        </span>
      </span>
    </Button>
  );
}
