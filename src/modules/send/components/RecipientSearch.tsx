"use client";

import { AppIcon } from "@/components/ui/app-icon";
import Image from "next/image";
import * as React from "react";

import type { Recipient } from "@/modules/send/types/send.types";
import { RecipientRow } from "@/modules/send/components/RecipientRow";

export function RecipientSearch({
  query,
  error,
  filteredRecipients,
  showRecentLabel,
  isSearchingUsername,
  onQueryChange,
  onSearchSubmit,
  onSelectRecipient,
}: {
  query: string;
  error: string | null;
  filteredRecipients: Recipient[];
  showRecentLabel: boolean;
  isSearchingUsername: boolean;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
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
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#9A9AA2] transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            aria-label="Clear recipient search"
          >
            <AppIcon icon="lucide:x" aria-hidden="true" width={18} height={18} />
          </button>
        ) : null}
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

        {isSearchingUsername ? (
          <div className="mt-3 space-y-2 rounded-[28px] bg-[#1C1C1E] p-3" aria-busy="true" aria-label="Searching username">
            {[1, 2].map((item) => (
              <div key={item} className="flex min-h-[68px] items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
                <span className="h-11 w-11 animate-pulse rounded-full bg-white/10" />
                <span className="flex-1 space-y-2">
                  <span className="block h-3 w-2/5 animate-pulse rounded bg-white/10" />
                  <span className="block h-2.5 w-3/5 animate-pulse rounded bg-white/10" />
                </span>
              </div>
            ))}
          </div>
        ) : filteredRecipients.length > 0 ? (
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
