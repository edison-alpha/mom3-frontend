"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Typography } from "@/components/ui/typography";
import * as React from "react";

import { WalletAvatar } from "@/components/ui/wallet-avatar";
import { truncateAddress } from "@/utils/address.utils";
import type { Recipient } from "@/modules/send/types/send.types";

export function RecipientHeader({ recipient }: { recipient: Recipient }) {
  return (
    <div className="rounded-[32px] bg-[#111217] p-5 shadow-[0_12px_44px_-24px_rgba(59,51,189,0.6)]">
      <WalletAvatar
        address={recipient.address}
        label={recipient.name}
        fallback={recipient.name}
        size="xl"
        className="mx-auto"
        fallbackClassName={recipient.color}
      />
      <div className="mt-4 flex items-center justify-center gap-2">
        <Typography as="h2" variant="h2">{recipient.handle}</Typography>
        {recipient.status === "Verified" ? (
          <AppIcon
            icon="material-symbols:verified-rounded"
            aria-hidden="true"
            width={22}
            height={22}
            className="text-[#ccff00]"
          />
        ) : null}
      </div>
      <p className="mt-2 text-center text-sm font-medium text-[#9A9AA2]">
        {recipient.name} • {truncateAddress(recipient.address, 5)}
      </p>
    </div>
  );
}
