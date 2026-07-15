"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import { TokenAssetBadge } from "@/modules/send/components/TokenAssetBadge";
import type { TokenRow } from "@/modules/send/types/send.types";
import { formatTokenBalance, formatUsd } from "@/lib/format";

export function AmountInput({
  token,
  amount,
  amountValidationMessage,
  totalPrimaryAssetsInUSD,
  onAmountChange,
  onMaxAmount,
}: {
  token: TokenRow;
  amount: string;
  amountValidationMessage: string | null;
  totalPrimaryAssetsInUSD: number | null;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 rounded-[22px] bg-black/20 p-3">
        <TokenAssetBadge token={token} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-white">{token.symbol}</span>
          <span className="block text-xs font-medium text-[#9A9AA2]">
            Balance {formatTokenBalance(token.balance)} {token.symbol}
          </span>
        </span>
      </div>

      <label htmlFor="send-amount" className="mt-5 block text-xs font-black uppercase text-[#77777f]">
        Amount
      </label>
      <div className="mt-2 flex h-16 items-center gap-3 rounded-[22px] bg-black/25 px-4 transition-shadow focus-within:ring-2 focus-within:ring-[#3B33BD]">
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
          isDisabled={token.balance <= 0}
          label="Max"
          color="transparent"
          size="compact"
          rounded="full"
          className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[#3B33BD]/20 px-3 text-xs font-black text-[#8F89FF] transition-colors hover:bg-[#3B33BD]/30 focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#9A9AA2]">
        <span>
          Receive: <span className="text-white">{token.chainName}</span>
        </span>
        <span>
          UA balance:{" "}
          <span className="text-white">
            {totalPrimaryAssetsInUSD === null ? "Loading" : formatUsd(totalPrimaryAssetsInUSD)}
          </span>
        </span>
      </div>

      {amountValidationMessage ? (
        <p id="send-amount-error" className="mt-2 text-xs font-semibold text-red-200">
          {amountValidationMessage}
        </p>
      ) : null}
    </>
  );
}
