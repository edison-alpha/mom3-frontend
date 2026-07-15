"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import * as React from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { truncateAddress } from "@/utils/address.utils";
import type { UniversalAccountRow } from "@/modules/profile/types/profile.types";

type UniversalAccountHeaderButtonProps = {
  ownerAddress: string;
  onOpen: () => void;
};

export function UniversalAccountHeaderButton({
  ownerAddress,
  onOpen,
}: UniversalAccountHeaderButtonProps) {
  return (
    <Button
      type="button"
      onClick={onOpen}
      color="dark"
      size="compact"
      rounded="full"
      disabled={!ownerAddress}
      aria-label="Open Universal Account details"
      className="flex h-10 max-w-[128px] items-center gap-2 rounded-full bg-[#1C1C1E] px-3 text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#ccff00]" aria-hidden="true" />
      <span className="truncate font-mono text-xs font-black tabular-nums">
        {ownerAddress ? truncateAddress(ownerAddress, 3) : "Wallet"}
      </span>
    </Button>
  );
}

type UniversalAccountOwnerRowProps = {
  icon: string;
  label: string;
  value: string;
  bordered?: boolean;
  onOpen: () => void;
};

export function UniversalAccountOwnerRow({
  icon,
  label,
  value,
  bordered,
  onOpen,
}: UniversalAccountOwnerRowProps) {
  return (
    <Button
      type="button"
      onClick={onOpen}
      variant="plain"
      size="lg"
      rounded="none"
      className={`flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD] ${
        bordered ? "border-b border-white/5" : ""
      }`}
      aria-label="Open Universal Account details"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3E] text-white">
        <AppIcon icon={icon} aria-hidden="true" width={20} height={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-white">{label}</span>
        <span className="mt-0.5 block text-xs font-medium text-[#9A9AA2]">{value}</span>
      </span>
      <AppIcon icon="lucide:chevron-right" aria-hidden="true" width={18} height={18} className="text-[#66666D]" />
    </Button>
  );
}

type ProfileUniversalAccountSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: UniversalAccountRow[];
  error: string | null;
  copiedAddress: string | null;
  onCopyAddress: (address: string, label: string) => void;
};

export function ProfileUniversalAccountSheet({
  open,
  onOpenChange,
  rows,
  error,
  copiedAddress,
  onCopyAddress,
}: ProfileUniversalAccountSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Universal Account"
      description="One wallet identity across EVM and Solana."
      closeLabel="Close Universal Account"
      contentClassName="space-y-2"
    >
      {rows.map((row) => (
        <Button
          type="button"
          key={row.label}
          onClick={() => onCopyAddress(row.address, row.label)}
          variant="plain"
          size="lg"
          rounded="lg"
          disabled={!row.address}
          aria-label={`Copy ${row.label} address`}
          className="flex min-h-[62px] w-full items-center gap-3 rounded-2xl bg-black/25 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A2A3E] text-[#8F89FF]">
            <AppIcon icon={row.icon} aria-hidden="true" width={20} height={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="shrink-0 text-sm font-bold text-white">{row.label}</span>
              <span className="min-w-0 truncate text-right font-mono text-xs font-bold tabular-nums text-white">
                {row.address ? truncateAddress(row.address) : "Not ready"}
              </span>
            </span>
            <span className="mt-0.5 block text-xs font-medium text-[#8E8E98]">
              {row.description}
            </span>
          </span>
          <AppIcon icon="lucide:copy" aria-hidden="true" width={16} height={16} className="shrink-0 text-[#66666D]" />
        </Button>
      ))}

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100">
          {error}
        </p>
      ) : null}

      {copiedAddress ? (
        <p className="text-center text-xs font-bold text-[#ccff00]">
          {copiedAddress} copied
        </p>
      ) : null}
    </BottomSheet>
  );
}
