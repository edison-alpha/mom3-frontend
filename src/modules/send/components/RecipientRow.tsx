"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import * as React from "react";

import { WalletAvatar } from "@/components/ui/wallet-avatar";
import { truncateAddress } from "@/utils/address.utils";
import { cn } from "@/lib/utils";
import type { Recipient } from "@/modules/send/types/send.types";

export function RecipientRow({
  recipient,
  selected,
  onSelect,
}: {
  recipient: Recipient;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onSelect}
      variant="ghost"
      size="lg"
      rounded="none"
      className={cn(
        "flex min-h-[74px] w-full items-center justify-start rounded-none px-4 py-3 text-left text-white transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD]",
        selected && "bg-[#3B33BD]/10",
      )}
    >
      <WalletAvatar
        address={recipient.address}
        imageUrl={recipient.avatarUrl}
        label={recipient.name}
        fallback={recipient.name}
        fallbackClassName={recipient.color}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-white">{recipient.handle}</span>
          {recipient.status === "Verified" ? (
            <AppIcon
              icon="material-symbols:verified-rounded"
              aria-hidden="true"
              width={16}
              height={16}
              className="text-[#ccff00]"
            />
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-xs font-medium text-[#9A9AA2]">
          {recipient.name} • {truncateAddress(recipient.address)}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-black text-[#9A9AA2]">
        {recipient.network}
      </span>
    </Button>
  );
}
