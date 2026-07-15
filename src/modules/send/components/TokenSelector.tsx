"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import { TokenRowItem } from "@/modules/send/components/TokenRowItem";
import { cn } from "@/lib/utils";
import type { TokenRow } from "@/modules/send/types/send.types";
import { formatUsd } from "@/lib/format";

export function TokenSelector({
  tokenRows,
  selectedToken,
  amount,
  amountValidationMessage,
  totalPrimaryAssetsInUSD,
  selectedTokenIsPrefilled,
  isLoading,
  accountError,
  error,
  onTokenSelect,
  onAmountChange,
  onMaxAmount,
  onRefreshAccount,
}: {
  tokenRows: TokenRow[];
  selectedToken: TokenRow | null;
  amount: string;
  amountValidationMessage: string | null;
  totalPrimaryAssetsInUSD: number | null;
  selectedTokenIsPrefilled: boolean;
  isLoading: boolean;
  accountError: string | null;
  error: string | null;
  onTokenSelect: (tokenId: string) => void;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onRefreshAccount: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black uppercase text-[#77777f]">Recipient gets</label>
        <span className="text-xs font-semibold text-[#9A9AA2]">
          {selectedTokenIsPrefilled ? "Prefilled" : `${tokenRows.length} routes`}
        </span>
      </div>

      <div className="mt-3 max-h-[38vh] space-y-2 overflow-y-auto pr-1">
        {isLoading && tokenRows.length === 0 ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[76px] rounded-[24px] border border-white/5 bg-black/20 p-3"
              aria-hidden="true"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/[0.08]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-16 rounded-full bg-white/[0.08]" />
                  <div className="h-2.5 w-20 rounded-full bg-white/[0.06]" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="ml-auto h-3.5 w-14 rounded-full bg-white/[0.08]" />
                  <div className="ml-auto h-2.5 w-12 rounded-full bg-white/[0.06]" />
                </div>
              </div>
            </div>
          ))
        ) : tokenRows.length > 0 ? (
          tokenRows.map((token) => (
            <div
              key={token.id}
              className={cn(
                "rounded-[24px]",
                selectedToken?.id === token.id && "bg-transparent",
              )}
            >
              <TokenRowItem
                token={token}
                selected={selectedToken?.id === token.id}
                onSelect={() => onTokenSelect(token.id)}
              />
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-white/5 bg-black/20 px-4 py-5 text-center">
            <p className="text-sm font-bold text-white">No token balance available yet.</p>
            <p className="mt-1 text-xs font-medium text-[#9A9AA2]">
              Refresh after deposit or wallet sync finishes.
            </p>
            <Button
              type="button"
              onClick={onRefreshAccount}
              color="transparent"
              size="compact"
              rounded="full"
              label="Refresh balances"
              className="mx-auto mt-3 flex h-10 items-center justify-center rounded-full bg-white/5 px-4 text-xs font-black text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            />
          </div>
        )}
      </div>

      <label htmlFor="send-amount" className="mt-5 block text-xs font-black uppercase text-[#77777f]">
        Amount
      </label>
      <div
        className={cn(
          "mt-2 flex h-16 items-center gap-3 rounded-[22px] bg-black/25 px-4 transition-shadow focus-within:ring-2 focus-within:ring-[#3B33BD]",
          amountValidationMessage && "ring-1 ring-red-400/30",
        )}
      >
        <input
          id="send-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="0.00"
          aria-invalid={amountValidationMessage ? "true" : undefined}
          aria-describedby={amountValidationMessage ? "send-amount-error" : undefined}
          className="min-w-0 flex-1 bg-transparent text-3xl font-black text-white placeholder:text-[#66666D] focus:outline-none"
        />
        <Button
          type="button"
          onClick={onMaxAmount}
          color="transparent"
          size="compact"
          disabled={!selectedToken || selectedToken.balance <= 0}
          className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[#3B33BD]/20 px-3 text-xs font-black text-[#8F89FF] transition-colors hover:bg-[#3B33BD]/30 focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            selectedToken && selectedToken.balance > 0
              ? `Use local ${selectedToken.symbol} balance on ${selectedToken.chainName}`
              : "No local balance for selected receive token"
          }
          label="Max"
        />
      </div>

      {selectedToken ? (
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#9A9AA2]">
          <span>
            Receive: <span className="text-white">{selectedToken.chainName}</span>
          </span>
          <span>
            UA balance:{" "}
            <span className="text-white">
              {totalPrimaryAssetsInUSD === null ? "Loading" : formatUsd(totalPrimaryAssetsInUSD)}
            </span>
          </span>
        </div>
      ) : null}

      {amountValidationMessage ? (
        <p id="send-amount-error" className="mt-2 text-xs font-semibold text-red-200">
          {amountValidationMessage}
        </p>
      ) : null}

      {accountError ? (
        <div className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-red-100">Real balance belum bisa dimuat.</p>
          <p className="mt-1 text-xs font-medium text-red-100/75">{accountError}</p>
          <Button
            type="button"
            onClick={onRefreshAccount}
            color="danger"
            size="compact"
            rounded="full"
            label="Retry"
            className="mt-3 flex h-10 items-center justify-center rounded-full bg-red-500/15 px-4 text-xs font-black text-red-50 transition-colors hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-red-200"
          />
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
    </>
  );
}
