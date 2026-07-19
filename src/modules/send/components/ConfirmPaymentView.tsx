"use client";

import { AppIcon } from "@/components/ui/app-icon";
import * as React from "react";
import Link from "next/link";

import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { WalletAvatar } from "@/components/ui/wallet-avatar";
import { formatTokenBalance, formatUsd } from "@/lib/format";
import { truncateAddress } from "@/utils/address.utils";
import { SentConfirmation } from "@/modules/send/components/SentConfirmation";
import { FailedConfirmation } from "@/modules/send/components/FailedConfirmation";
import { useConfirmPaymentState } from "@/modules/send/hooks/useConfirmPaymentState";
import { getFeeBreakdownRows, getFeeTokenRows, getTotalFeeLabel } from "@/providers/universal-account/services/gas-fee.service";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function ConfirmPaymentView() {
  const state = useConfirmPaymentState();

  const feeRows = state.sendPreview ? getFeeBreakdownRows(state.sendPreview.transaction) : [];
  const feeTokenRows = state.sendPreview ? getFeeTokenRows(state.sendPreview.transaction) : [];

  const estimatedUsd = React.useMemo(() => {
    if (!state.selectedToken || !state.amount) return null;
    const price = state.selectedToken.balance > 0 && state.selectedToken.amountInUSD > 0
      ? state.selectedToken.amountInUSD / state.selectedToken.balance
      : ["USDC", "USDT"].includes(state.selectedToken.symbol.toUpperCase())
        ? 1
        : null;
    if (price === null) return null;
    return Number(state.amount) * price;
  }, [state.selectedToken, state.amount]);

  if (
    state.transactionId &&
    state.sendPreview &&
    state.selectedToken &&
    state.recipient
  ) {
    return (
      <MobileShell>
        <MobilePageHeader
          title="Transaction complete"
          leading={
            <Button
              type="button"
              onClick={state.handleSuccessBack}
              color="dark"
              size="icon"
              rounded="full"
              startIcon="lucide:x"
              aria-label="Back to dashboard"
            />
          }
        />
        <SentConfirmation
          amount={state.amount}
          tokenSymbol={state.selectedToken.symbol}
          chainName={state.selectedToken.chainName}
          recipientName={state.recipient.name}
          recipientAddress={state.recipient.address}
          transactionId={state.transactionId}
          feeLabel={getTotalFeeLabel(state.sendPreview.transaction)}
          onSendAgain={state.handleSendAgain}
          onBack={state.handleSuccessBack}
        />
      </MobileShell>
    );
  }

  if (state.error && !state.isPreparing && !state.isSigning) {
    return (
      <MobileShell>
        <MobilePageHeader title="Payment status" />
        <FailedConfirmation
          message={state.error}
          onRetry={state.handleRetry}
          onBack={state.handleBack}
        />
      </MobileShell>
    );
  }

  if (state.isUsernameLoading || !state.hasUsername) {
    return (
      <MobileShell>
        <MobilePageHeader title="Send" leading={<Button type="button" onClick={state.handleBack} color="dark" size="icon" rounded="full" startIcon="lucide:chevron-left" aria-label="Back to send" />} />
        {state.isUsernameLoading ? (
          <section className="mt-6 rounded-[28px] bg-[#111217] p-5" aria-busy="true" aria-label="Checking username">
            <SkeletonText className="h-5 w-44" />
            <SkeletonText className="mt-3 h-4 w-full" />
            <Skeleton className="mt-5 h-14 w-full rounded-full" />
          </section>
        ) : (
          <section className="mt-6 rounded-[28px] border border-[#8F89FF]/25 bg-[#111217] p-5 text-center" role="alert">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3B33BD]/25 text-[#8F89FF]">
              <AppIcon icon="lucide:at-sign" aria-hidden="true" width={28} height={28} />
            </span>
            <h2 className="mt-4 text-lg font-black text-white">Claim your username first</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#A7A7B7]">You need a Mom3 username before you can send assets.</p>
            <Link href="/claim-username" className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#3B33BD] px-5 text-base font-black text-[#ccff00] focus-visible:ring-2 focus-visible:ring-[#8F89FF]">Claim username <AppIcon icon="lucide:arrow-right" aria-hidden="true" width={18} height={18} /></Link>
          </section>
        )}
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <MobilePageHeader
        title="Confirm Payment"
        leading={
          <Button
            type="button"
            onClick={state.handleBack}
            color="dark"
            size="icon"
            rounded="full"
            startIcon="lucide:chevron-left"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            aria-label="Back to send"
          />
        }
      />

      <section className="mt-5 flex flex-1 flex-col">
        {/* Recipient summary */}
        <div className="rounded-[32px] bg-[#111217] p-5 shadow-[0_12px_44px_-24px_rgba(59,51,189,0.6)]">
          {state.isResolvingRecipient ? (
            <div className="py-2" aria-busy="true" role="status">
              <span className="sr-only">Loading recipient details.</span>
              <Skeleton className="mx-auto h-24 w-24 rounded-full" />
              <SkeletonText className="mx-auto mt-4 h-7 w-32" />
              <SkeletonText className="mx-auto mt-2 h-4 w-44" />
            </div>
          ) : state.recipient ? (
            <>
            <WalletAvatar
              address={state.recipient.address}
              imageUrl={state.recipient.avatarUrl}
                label={state.recipient.name}
                fallback={state.recipient.name}
                size="xl"
                className="mx-auto"
                fallbackClassName={state.recipient.color}
              />
              <div className="mt-4 flex items-center justify-center gap-2">
                <Typography as="h2" variant="h2">{state.recipient.handle}</Typography>
                {state.recipient.status === "Verified" ? (
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
                {state.recipient.name} • {truncateAddress(state.recipient.address, 5)}
              </p>
            </>
          ) : (
            <div className="py-8 text-center text-sm font-medium text-[#9A9AA2]">Recipient not found</div>
          )}
        </div>

        {/* Amount card */}
        <div className="mt-4 rounded-[28px] bg-[#111217] p-5">
          <Typography variant="label" color="muted" align="center">You send</Typography>
          <div className="mt-2 text-center">
            <span className="text-4xl font-black text-white">
              {state.amount ? formatTokenBalance(Number(state.amount)) : "0.00"}
            </span>
            <span className="ml-2 text-xl font-black text-[#ccff00]">
              {state.selectedToken?.symbol ?? "---"}
            </span>
          </div>
          {estimatedUsd !== null ? (
            <p className="mt-1 text-center text-sm font-semibold text-[#9A9AA2]">
              ≈ {formatUsd(estimatedUsd)}
            </p>
          ) : null}
          <div className="mt-4 flex items-start justify-between border-t border-white/5 pt-4 text-sm">
            <span className="text-[#9A9AA2]">Recipient address</span>
            <span className="max-w-[62%] truncate text-right font-mono text-xs font-bold text-white">{state.recipient?.address || "---"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-[#9A9AA2]">Recipient receives</span>
            <span className="font-mono font-black text-white">
              {state.amount ? formatTokenBalance(Number(state.amount)) : "0.00"} {state.selectedToken?.symbol ?? ""}
            </span>
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="mt-4 rounded-[28px] bg-[#111217] p-5">
          <Typography as="h3" variant="label" color="muted">Transaction details</Typography>

          {!state.sendPreview || state.isPreparing ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#9A9AA2]">
              <AppIcon icon="lucide:loader-circle" aria-hidden="true" width={18} height={18} className="animate-spin" />
              Preparing preview...
            </div>
          ) : (
            <>
              <dl className="mt-4 space-y-2.5 text-sm">
                {feeRows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3">
                    <dt className="text-[#9A9AA2]">{row.label}</dt>
                    <dd className="flex items-center justify-end gap-2 font-mono font-bold tabular-nums">
                      {row.originalValue ? (
                        <span className="text-[#77777F] line-through decoration-[#77777F]">
                          {row.originalValue}
                        </span>
                      ) : null}
                      <span className={row.originalValue ? "text-[#ccff00]" : "text-white"}>
                        {row.value}
                      </span>
                    </dd>
                  </div>
                ))}
                {feeTokenRows.length > 0 ? (
                  <div className="border-t border-white/10 pt-2.5">
                    {feeTokenRows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-3">
                        <dt className="text-[#9A9AA2]">Fee token</dt>
                        <dd className="text-right font-mono text-xs font-bold tabular-nums text-white">
                          {row.label}
                        </dd>
                      </div>
                    ))}
                  </div>
                ) : null}
              </dl>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex items-start justify-between gap-3 text-sm">
                  <dt className="font-bold text-white">Estimated total fee</dt>
                  <dd className="font-mono font-black tabular-nums text-[#ccff00]">
                    {getTotalFeeLabel(state.sendPreview.transaction)}
                  </dd>
                </div>
              </div>

            </>
          )}
        </div>

        {state.accountError ? (
          <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3">
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

        {state.notice ? (
          <div
            className="mt-4 rounded-2xl bg-[#3B33BD]/20 px-4 py-3 text-sm font-semibold text-[#C9C6FF]"
            role="status"
          >
            {state.notice}
          </div>
        ) : null}

        <div className="mt-auto pt-5">
          <Button
            type="button"
            onClick={() => void state.handleConfirmSend()}
            isDisabled={
              !state.isReady ||
              state.isPreparing ||
              state.isSigning ||
              Boolean(state.transactionId)
            }
            isLoading={state.isSigning}
            color="warning"
            label={state.isSigning ? "Signing..." : "Confirm Payment"}
            startIcon="lucide:check-circle"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#ccff00] text-base font-black text-[#3B33BD] shadow-[0_10px_28px_-10px_rgba(204,255,0,0.5)] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/70 disabled:cursor-not-allowed disabled:bg-[#2A2A3E] disabled:text-[#77777f]"
          />
        </div>
      </section>
    </MobileShell>
  );
}
