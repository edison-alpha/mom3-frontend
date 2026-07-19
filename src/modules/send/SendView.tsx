"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { MobileBottomBar, MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AmountInput } from "@/modules/send/components/AmountInput";
import { RecipientHeader } from "@/modules/send/components/RecipientHeader";
import { RecipientSearch } from "@/modules/send/components/RecipientSearch";
import { TokenList } from "@/modules/send/components/TokenList";
import { useSendState } from "@/modules/send/hooks/useSendState";

export default function SendView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTo = searchParams.get("to") ?? "";
  const initialAsset = searchParams.get("asset") ?? "";
  const initialChain = searchParams.get("chain") ?? "";
  const initialAmount = searchParams.get("amount") ?? "";
  const from = searchParams.get("from") === "dashboard" ? "dashboard" : "assets";

  const state = useSendState(initialTo, initialAsset, initialChain, initialAmount);
  const reduceMotion = useReducedMotion();
  const [tokenQuery, setTokenQuery] = React.useState("");

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.canSend || !state.selectedRecipient || !state.selectedToken) return;

    const params = new URLSearchParams();
    params.set(
      "to",
      state.selectedRecipient.handle.startsWith("@")
        ? state.selectedRecipient.handle
        : state.selectedRecipient.address,
    );
    params.set("asset", state.selectedToken.symbol);
    params.set("chain", state.selectedToken.chainName);
    params.set("amount", state.amount.trim());
    params.set("from", from);
    router.push(`/send/confirm?${params.toString()}`);
  };

  const pageTitle =
    state.step === "amount" ? "Enter Amount" : state.step === "token" ? "Select Coin" : "Send";

  const shellBottomSlot =
    state.step === "token" ? (
      <MobileBottomBar>
        <div className="w-full max-w-md">
          <label htmlFor="token-search" className="sr-only">
            Search coins
          </label>
          <div className="flex h-14 w-full items-center gap-3 rounded-full bg-[#1C1C1E]/90 px-5 shadow-[0_16px_34px_-18px_rgba(0,0,0,0.95)] backdrop-blur-md">
            <AppIcon
              icon="icon-park-outline:search"
              aria-hidden="true"
              width={24}
              height={24}
              className="text-[#85858d]"
            />
            <input
              id="token-search"
              type="search"
              autoComplete="off"
              value={tokenQuery}
              onChange={(event) => setTokenQuery(event.target.value)}
              placeholder="Search coin or chain"
              className="min-w-0 flex-1 bg-transparent text-base font-bold text-white placeholder:text-[#9A9AA2] focus:outline-none"
            />
          </div>
        </div>
      </MobileBottomBar>
    ) : null;

  return (
    <MobileShell bottomSlot={shellBottomSlot}>
      <MobilePageHeader
        title={pageTitle}
        leading={
          state.step !== "recipient" ? (
            <Button
              type="button"
              onClick={state.goBack}
              color="dark"
              size="icon"
              rounded="full"
              startIcon="lucide:chevron-left"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
              aria-label="Go back"
            />
          ) : (
            <Link
              href={from === "dashboard" ? "/dashboard" : "/assets"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
              aria-label="Back to assets"
            >
              <AppIcon icon="lucide:chevron-left" aria-hidden="true" width={28} height={28} />
            </Link>
          )
        }
      />

      {state.selectedRecipient ? (
        <section className="mt-5 flex flex-1 flex-col">
          {state.step !== "token" ? <RecipientHeader recipient={state.selectedRecipient} /> : null}

          {state.step === "token" ? (
            <div className="flex flex-1 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-[#77777f]">Select coin</h2>
                <span className="text-xs font-semibold text-[#9A9AA2]">{state.tokenRows.length} assets</span>
              </div>
              <div className="flex-1 overflow-y-auto pb-4">
                <TokenList
                  tokenRows={state.tokenRows}
                  selectedToken={state.selectedToken}
                  isLoading={state.isLoading}
                  searchQuery={tokenQuery}
                  onTokenSelect={state.selectToken}
                />
              </div>
            </div>
          ) : state.step === "amount" && state.selectedToken ? (
            <motion.form
              key={`${state.selectedToken.id}-${state.step}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 28, stiffness: 260 }}
              onSubmit={handleSend}
              className="mt-5 rounded-[28px] bg-[#111217] p-4"
            >
              <AmountInput
                token={state.selectedToken}
                amount={state.amount}
                amountValidationMessage={state.amountValidationMessage}
                totalPrimaryAssetsInUSD={state.totalPrimaryAssetsInUSD}
                onAmountChange={state.handleAmountChange}
                onMaxAmount={state.handleMaxAmount}
              />

              {state.accountError ? (
                <div className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3">
                  <p className="text-sm font-semibold text-red-100">Unable to load your balance</p>
                  <p className="mt-1 text-xs font-medium text-red-100/75">
                    Check your connection, then try again.
                  </p>
                  <Button
                    type="button"
                    onClick={() => void state.refreshAccount()}
                    color="danger"
                    size="compact"
                    rounded="full"
                    label="Retry"
                    className="mt-3 flex h-10 items-center justify-center rounded-full bg-red-500/15 px-4 text-xs font-black text-red-50 transition-colors hover:bg-red-500/20"
                  />
                </div>
              ) : null}

              {state.error ? (
                <div className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                  {state.error}
                </div>
              ) : null}

              <Button
                type="submit"
                isDisabled={!state.canSend}
                isLoading={state.isLoading}
                color="primary"
                label="Send"
                startIcon="lucide:send"
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#3B33BD] text-base font-black text-[#ccff00] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:cursor-not-allowed disabled:bg-[#2A2A3E] disabled:text-[#77777f]"
                fullWidth
                size="lg"
              />
            </motion.form>
          ) : null}
        </section>
      ) : (
        <RecipientSearch
          query={state.query}
          error={state.error}
          filteredRecipients={state.filteredRecipients}
          showRecentLabel={state.showRecentLabel}
          isSearchingUsername={state.isSearchingUsername}
          onQueryChange={(value) => {
            state.setQuery(value);
            state.setError(null);
          }}
          onSearchSubmit={state.handleSearchSubmit}
          onSelectRecipient={state.selectRecipient}
          onClearRecentRecipients={() => { void state.clearRecentRecipients(); }}
          isClearingRecentRecipients={state.isClearingRecentRecipients}
        />
      )}
    </MobileShell>
  );
}
