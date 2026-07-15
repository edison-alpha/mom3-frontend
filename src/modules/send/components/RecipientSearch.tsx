"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import * as React from "react";

import type { Recipient } from "@/modules/send/types/send.types";
import { RecipientRow } from "@/modules/send/components/RecipientRow";

export function RecipientSearch({
  query,
  error,
  filteredRecipients,
  showRecentLabel,
  onQueryChange,
  onSearchSubmit,
  onScanOpen,
  onSelectRecipient,
}: {
  query: string;
  error: string | null;
  filteredRecipients: Recipient[];
  showRecentLabel: boolean;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onScanOpen: () => void;
  onSelectRecipient: (recipient: Recipient) => void;
}) {
  return (
    <>
      <label htmlFor="recipient-search" className="sr-only">
        Search with tag or address
      </label>
      <div className="mt-5 flex h-12 items-center gap-3 rounded-2xl bg-[#1f1f21] px-4 transition-shadow focus-within:ring-2 focus-within:ring-[#3B33BD]">
        <AppIcon icon="icon-park-outline:search" aria-hidden="true" width={20} height={20} className="shrink-0 text-[#9A9AA2]" />
        <input
          id="recipient-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearchSubmit();
            }
          }}
          placeholder="mom3 tag or wallet address"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "recipient-search-error" : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-[#8E8E93] focus:outline-none"
        />
        <Button
          type="button"
          onClick={onScanOpen}
          color="plain"
          size="icon"
          rounded="lg"
          startIcon="lucide:scan-line"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#3B33BD] transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          aria-label="Scan address"
        />
      </div>
      {error ? (
        <p id="recipient-search-error" className="mt-2 text-xs font-semibold text-red-200">
          {error}
        </p>
      ) : null}

      <section className="mt-5 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">{showRecentLabel ? "Recent" : "Recipients"}</h2>
          <span className="rounded-full bg-[#1C1C1E] px-3 py-1 text-xs font-bold text-[#9A9AA2]">
            {filteredRecipients.length}
          </span>
        </div>

        {filteredRecipients.length > 0 ? (
          <div className="mt-3 overflow-hidden rounded-[28px] bg-[#1C1C1E]">
            {filteredRecipients.map((recipient, index) => (
              <div
                key={recipient.id}
                className={index < filteredRecipients.length - 1 ? "border-b border-white/5" : ""}
              >
                <RecipientRow
                  recipient={recipient}
                  selected={false}
                  onSelect={() => onSelectRecipient(recipient)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-1 flex-col items-center justify-center rounded-[28px] bg-[#1C1C1E] px-6 py-12 text-center">
            <Image src="/send-friend.png" alt="" width={132} height={96} className="h-auto w-28 object-contain" priority />
            <h2 className="mt-5 text-xl font-bold tracking-tight text-white">No recipient found</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#9A9AA2]">
              Try a mom3 tag like @raka or paste a wallet address.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
