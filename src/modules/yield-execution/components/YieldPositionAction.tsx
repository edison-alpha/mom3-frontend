"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import * as React from "react";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { formatTokenBalance, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  getFeeBreakdownRows,
  getFeeTokenRows,
  getFundingRows,
  getTotalFeeLabel,
} from "@/modules/send/utils/send.utils";
import { useYieldExecution } from "@/modules/yield-execution/hooks/useYieldExecution";
import { useYieldPosition } from "@/modules/yield-execution/hooks/useYieldPosition";
import type { YieldAction } from "@/modules/yield-execution/types/yield-execution.types";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { useUniversalTransactionStatus } from "@/providers/universal-account/hooks/useUniversalTransactionStatus";
import { truncateAddress } from "@/utils/address.utils";

type Props = {
  chainId: number;
  marketId: string;
  protocol: string;
  network: string;
  assetSymbol: string;
  universalAssetBalance: number;
  onRefresh: () => Promise<unknown>;
};

function YieldPositionCardSkeleton({ protocol }: { protocol: string }) {
  return (
    <section
      className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5"
      aria-label={`Loading ${protocol} position`}
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">Loading your {protocol} position and available actions.</span>
      <SkeletonText className="h-5 w-44" />
      <SkeletonText className="mt-2 h-3.5 w-36" />
      <Skeleton className="mt-3 h-12 w-full rounded-full" />
    </section>
  );
}

const AMOUNT_KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"] as const;
const AMOUNT_PERCENTAGES = [25, 50, 75, 100] as const;
type AmountKeypadKey = (typeof AMOUNT_KEYPAD_KEYS)[number];

function tokenIcon(symbol: string) {
  const normalized = symbol.toLowerCase();
  if (normalized.includes("usdc")) return "cryptocurrency-color:usdc";
  if (normalized.includes("usdt")) return "cryptocurrency-color:usdt";
  if (normalized.includes("eth")) return "cryptocurrency-color:eth";
  if (normalized.includes("btc")) return "cryptocurrency-color:btc";
  if (normalized.includes("dai")) return "cryptocurrency-color:dai";
  return "solar:wallet-money-bold";
}

function amountAfterKey(current: string, key: AmountKeypadKey) {
  if (key === "backspace") return current.slice(0, -1);
  if (key === ".") {
    if (current.includes(".")) return current;
    return current ? `${current}.` : "0.";
  }
  if (current === "0") return key;
  return `${current}${key}`;
}

export function YieldPositionAction({
  chainId,
  marketId,
  protocol,
  network,
  assetSymbol,
  universalAssetBalance,
  onRefresh,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { accountInfo } = useUniversalAccount();
  const positionAccount = chainId === 101
    ? accountInfo.solanaSmartAccount
    : accountInfo.evmSmartAccount;
  const position = useYieldPosition(marketId, positionAccount, chainId);
  const supply = useYieldExecution("supply");
  const withdraw = useYieldExecution("withdraw");
  const resetSupply = supply.reset;
  const resetWithdraw = withdraw.reset;
  const refreshPosition = position.refresh;
  const [mode, setMode] = React.useState<YieldAction | null>(null);
  const [amount, setAmount] = React.useState("");
  const refreshedTransactionRef = React.useRef<string | null>(null);
  const transactionId = supply.transactionId || withdraw.transactionId;
  const receiptMode: YieldAction = supply.transactionId ? "supply" : "withdraw";
  const transactionStatus = useUniversalTransactionStatus(transactionId);
  const active = mode === "withdraw" ? withdraw : supply;
  const transaction = active.transaction;
  const suppliedBalance = position.data?.supplied_balance ?? 0;
  const hasPosition = suppliedBalance > 0;
  const maxAmount = mode === "withdraw" ? suppliedBalance : universalAssetBalance;
  const numericAmount = Number(amount || 0);
  const validAmount = numericAmount > 0 && numericAmount <= maxAmount;
  const estimatedPosition = mode === "withdraw"
    ? Math.max(0, suppliedBalance - numericAmount)
    : suppliedBalance + numericAmount;

  const resetFlow = React.useCallback(() => {
    resetSupply();
    resetWithdraw();
    setAmount("");
    setMode(null);
  }, [resetSupply, resetWithdraw]);

  React.useEffect(() => {
    if (
      transactionStatus.state !== "completed" ||
      !transactionId ||
      refreshedTransactionRef.current === transactionId
    ) return;
    refreshedTransactionRef.current = transactionId;
    void Promise.all([refreshPosition(), onRefresh()]);
  }, [onRefresh, refreshPosition, transactionId, transactionStatus.state]);

  React.useEffect(() => {
    if (!mode) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !active.isSigning) resetFlow();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [active.isSigning, mode, resetFlow]);

  const transition = reduceMotion ? { duration: 0 } : { type: "spring" as const, damping: 30, stiffness: 280 };

  if (transactionId) {
    const failed = transactionStatus.state === "failed";
    const completed = transactionStatus.state === "completed";
    const status = completed ? "Completed" : failed ? "Failed" : transactionStatus.state === "confirming" ? "Confirming" : "Submitted";
    return (
      <motion.section initial={{ y: reduceMotion ? 0 : "100%" }} animate={{ y: 0 }} transition={transition} className="fixed inset-0 z-[70] overflow-y-auto bg-black" role="status" aria-label={`${receiptMode} transaction receipt`}>
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
          <div className="flex h-12 items-center justify-between">
            <span className="text-sm font-black text-white">Transaction receipt</span>
            <Button type="button" color="dark" size="icon" rounded="full" startIcon="solar:close-circle-bold" aria-label="Close receipt" onClick={() => { void Promise.all([refreshPosition(), onRefresh()]); resetFlow(); }} />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className={`mt-8 flex h-20 w-20 items-center justify-center rounded-full ring-1 ${failed ? "bg-red-500/15 text-red-300 ring-red-400/30" : completed ? "bg-[#ccff00]/15 text-[#ccff00] ring-[#ccff00]/30" : "bg-violet-500/15 text-violet-300 ring-violet-400/30"}`}>
              <AppIcon icon={failed ? "lucide:circle-x" : completed ? "icon-park-solid:success" : "lucide:clock-3"} aria-hidden="true" width={42} height={42} />
            </span>
            <Typography as="h2" variant="h2" className="mt-4">
              {failed ? "Transaction failed" : completed ? `${receiptMode === "supply" ? "Supply" : "Withdrawal"} complete` : `${receiptMode === "supply" ? "Supply" : "Withdrawal"} submitted`}
            </Typography>
            <Typography variant="body-sm" color="muted" align="center" className="mt-1.5">
              {failed ? "No confirmed position change was recorded." : completed ? "Your on-chain position has been updated." : "Particle is confirming your transaction."}
            </Typography>
          </div>
          <div className="mt-5 rounded-[20px] bg-[#111217] p-4">
            <div className="text-center">
              <p className="text-xs font-bold text-[#9A9AA2]">{receiptMode === "supply" ? "Amount supplied" : "Amount withdrawn"}</p>
              <p className="mt-1 font-mono text-3xl font-black text-white">{formatTokenBalance(numericAmount)} <span className="text-lg text-[#ccff00]">{assetSymbol}</span></p>
            </div>
            <dl className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-[#9A9AA2]">Status</dt><dd className="font-bold text-white">{status}</dd></div>
              <div className="flex justify-between"><dt className="text-[#9A9AA2]">Protocol</dt><dd className="font-bold text-white">{protocol}</dd></div>
              <div className="flex justify-between"><dt className="text-[#9A9AA2]">Network</dt><dd className="font-bold text-white">{network}</dd></div>
              <div className="flex justify-between"><dt className="text-[#9A9AA2]">Total fee</dt><dd className="font-mono font-bold text-white">{getTotalFeeLabel(transaction)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9A9AA2]">Transaction ID</dt><dd className="font-mono text-xs font-bold text-white">{truncateAddress(transactionId, 6)}</dd></div>
            </dl>
            <a href={`https://universalx.app/activity/details?id=${transactionId}`} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-[#ccff00]">
              View transaction details <AppIcon icon="lucide:external-link" aria-hidden="true" width={16} height={16} />
            </a>
          </div>
          <div className="mt-auto pt-6"><Button type="button" color={failed ? "danger" : "warning"} size="lg" rounded="full" fullWidth label="Back to market" startIcon="solar:alt-arrow-left-bold" onClick={() => { void Promise.all([refreshPosition(), onRefresh()]); resetFlow(); }} /></div>
        </div>
      </motion.section>
    );
  }

  if (!mode) {
    if (position.isLoading) {
      return <YieldPositionCardSkeleton protocol={protocol} />;
    }

    return (
      <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5" aria-label={`${protocol} position actions`}>
        <Typography as="h2" variant="h4">{hasPosition ? `Your ${protocol} position` : `Earn with ${protocol}`}</Typography>
        <Typography variant="body-sm" color="muted" className="mt-1.5">
          {hasPosition
            ? `Supplied: ${formatTokenBalance(suppliedBalance)} ${assetSymbol}.`
            : `Universal balance: ${formatTokenBalance(universalAssetBalance)} ${assetSymbol}.`}
        </Typography>
        {position.error ? (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-red-500/10 px-3 py-2" role="alert">
            <p className="text-xs font-semibold text-red-100">Position unavailable. You can still supply.</p>
            <button type="button" className="min-h-10 rounded-full px-3 text-xs font-black text-red-100 focus-visible:ring-2 focus-visible:ring-red-300" onClick={() => void position.refresh()}>Retry</button>
          </div>
        ) : null}
        <div className={cn("mt-3 grid gap-3", hasPosition ? "grid-cols-2" : "grid-cols-1")}>
          <Button type="button" color="primary" size="lg" rounded="full" fullWidth label="Supply" startIcon="solar:upload-minimalistic-bold" onClick={() => setMode("supply")} />
          {hasPosition ? <Button type="button" color="dark" size="lg" rounded="full" fullWidth label="Withdraw" startIcon="solar:download-minimalistic-bold" onClick={() => setMode("withdraw")} /> : null}
        </div>
        {universalAssetBalance <= 0 ? (
          <Link
            href={`/deposit?chainId=${chainId}&asset=${encodeURIComponent(assetSymbol)}`}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-4 text-sm font-black text-[#ccff00] focus-visible:ring-2 focus-visible:ring-[#ccff00]"
          >
            Deposit {assetSymbol}
            <AppIcon icon="lucide:arrow-right" aria-hidden="true" width={16} height={16} />
          </Link>
        ) : null}
      </section>
    );
  }

  const actionLabel = mode === "supply" ? "Supply" : "Withdraw";
  const screenTitle = mode === "supply" ? "Supply" : "Withdrawal";
  const showUsdEstimate = /usdc|usdt|dai|usde/i.test(assetSymbol);
  const feeRows = getFeeBreakdownRows(transaction);
  const fundingRows = getFundingRows(transaction);
  const feeTokenRows = getFeeTokenRows(transaction);
  const callLabel = active.intent?.calls.map((call) => call.method).join(" → ") || "Validated by mom3";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validAmount) return;
    if (transaction) await active.execute();
    else await active.prepare(marketId, amount, chainId);
  }

  function pressAmountKey(key: AmountKeypadKey) {
    setAmount((current) => amountAfterKey(current, key));
    active.reset();
  }

  function setAmountPercentage(percent: (typeof AMOUNT_PERCENTAGES)[number]) {
    const nextAmount = Math.floor((maxAmount * percent / 100) * 1_000_000) / 1_000_000;
    setAmount(nextAmount > 0 ? String(nextAmount) : "");
    active.reset();
  }

  function handleAmountKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (transaction) return;
    const key = event.key === "Backspace"
      ? "backspace"
      : event.key === ","
        ? "."
        : event.key;
    if (!AMOUNT_KEYPAD_KEYS.includes(key as AmountKeypadKey)) return;
    event.preventDefault();
    pressAmountKey(key as AmountKeypadKey);
  }

  return (
    <motion.section initial={{ y: reduceMotion ? 0 : "100%" }} animate={{ y: 0 }} transition={transition} className="fixed inset-0 z-[70] overflow-y-auto bg-black" role="dialog" aria-modal="true" aria-labelledby="yield-action-title">
      <form onSubmit={submit} className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <div className="relative flex min-h-16 items-center justify-center px-14">
          <Typography id="yield-action-title" as="h2" variant="h2" align="center">{screenTitle}</Typography>
          <Button type="button" color="transparent" size="icon" rounded="full" startIcon="solar:alt-arrow-left-bold" aria-label="Close action" className="absolute left-0 text-white" onClick={resetFlow} />
        </div>

        <div className="mt-2 flex justify-center">
          <div className="inline-flex min-h-14 items-center gap-3 rounded-full bg-[#17191E] px-4 py-2.5 ring-1 ring-white/[0.04]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
              <AppIcon icon={tokenIcon(assetSymbol)} aria-hidden="true" width={28} height={28} />
            </span>
            <span className="font-mono text-base font-black tabular-nums text-white">
              {assetSymbol}: {formatTokenBalance(maxAmount)}
            </span>
          </div>
        </div>

        <div className="mt-10 flex min-h-32 flex-col items-center justify-center text-center">
          <div
            id="yield-position-amount"
            role="spinbutton"
            tabIndex={transaction ? -1 : 0}
            aria-label={`${actionLabel} amount`}
            aria-valuenow={numericAmount}
            aria-valuemin={0}
            aria-valuemax={maxAmount}
            aria-invalid={amount.length > 0 && !validAmount}
            aria-describedby={amount.length > 0 && !validAmount ? "yield-amount-error" : undefined}
            onKeyDown={handleAmountKeyDown}
            className="flex w-full max-w-full items-baseline justify-center gap-2 overflow-x-auto rounded-2xl px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#8F89FF]"
          >
            <span className="shrink-0 whitespace-nowrap font-mono text-[clamp(2.5rem,11vw,3.5rem)] font-black leading-none tabular-nums tracking-[-0.05em] text-white">
              {amount || "0"}
            </span>
            <span className="shrink-0 whitespace-nowrap font-mono text-[clamp(1.75rem,7vw,2.5rem)] font-black leading-none tracking-[-0.03em] text-[#70777A]">{assetSymbol}</span>
          </div>
          {showUsdEstimate ? <p className="mt-3 font-mono text-xl font-black tabular-nums text-[#8A9094]">≈{formatUsd(numericAmount)}</p> : null}
        </div>

        {!transaction ? (
          <div className="mt-auto pt-8">
            <div className="flex min-h-14 items-start gap-2.5 rounded-[22px] bg-[#17191E] px-4 py-3.5 text-sm font-semibold leading-relaxed text-[#C8C8CE]">
              <AppIcon icon="lucide:info" aria-hidden="true" width={17} height={17} className="mt-0.5 shrink-0 text-[#8F89FF]" />
              <p>{mode === "supply" ? `Your ${assetSymbol} will be supplied to ${protocol} on ${network} from the Universal Account.` : `Your ${assetSymbol} will return to the Universal Account after ${protocol} confirms the withdrawal.`}</p>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Amount percentage">
              {AMOUNT_PERCENTAGES.map((percent) => {
                const percentageAmount = maxAmount * percent / 100;
                const selected = maxAmount > 0 && Math.abs(numericAmount - percentageAmount) < 0.000001;
                return (
                  <button
                    key={percent}
                    type="button"
                    disabled={maxAmount <= 0}
                    aria-pressed={selected}
                    className={`flex h-12 items-center justify-center rounded-2xl border font-mono text-sm font-black transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#8F89FF] ${selected ? "border-[#8F89FF] bg-[#3B33BD]/25 text-white" : "border-white/10 bg-white/[0.03] text-[#D7D7DC] hover:bg-white/[0.07]"}`}
                    onClick={() => setAmountPercentage(percent)}
                  >
                    {percent}%
                  </button>
                );
              })}
            </div>

            {amount.length > 0 && !validAmount ? <p id="yield-amount-error" className="mt-2 text-center text-xs font-semibold text-red-200" role="alert">Enter an amount up to {formatTokenBalance(maxAmount)} {assetSymbol}.</p> : null}

            <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1" role="group" aria-label="Amount keypad">
              {AMOUNT_KEYPAD_KEYS.map((key) => {
                const isBackspace = key === "backspace";
                const isDecimal = key === ".";
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={isBackspace ? "Delete last digit" : isDecimal ? "Decimal point" : `Number ${key}`}
                    disabled={(isBackspace && amount.length === 0) || (isDecimal && amount.includes("."))}
                    className={`flex h-14 items-center justify-center rounded-full bg-transparent font-mono text-[2rem] font-black tabular-nums transition-[transform,background-color] duration-100 ease-out hover:bg-[#3B33BD]/10 active:scale-[0.92] active:bg-[#3B33BD]/25 disabled:opacity-25 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#8F89FF] ${isBackspace ? "text-[#8F89FF]" : "text-white"}`}
                    onClick={() => pressAmountKey(key)}
                  >
                    {isBackspace ? <AppIcon icon="lucide:delete" aria-hidden="true" width={26} height={26} /> : key}
                  </button>
                );
              })}
            </div>

            {active.error ? <p className="mt-2 text-center text-xs font-semibold text-red-200" role="alert">{active.error}</p> : null}
            <Button type="submit" color="primary" size="lg" rounded="full" fullWidth className="mt-3" label={`Review ${actionLabel.toLowerCase()}`} startIcon="solar:alt-arrow-right-bold" isLoading={active.isPreparing} isDisabled={!validAmount} aria-busy={active.isPreparing} />
          </div>
        ) : null}

        {transaction ? (
          <div className="mt-4 rounded-[20px] bg-[#111217] p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2"><AppIcon icon="lucide:shield-check" aria-hidden="true" width={18} height={18} className="text-[#ccff00]" /><p className="text-sm font-black text-white">Review {actionLabel.toLowerCase()}</p></div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[#9A9AA2]">Amount</dt><dd className="font-mono font-bold text-white">{formatTokenBalance(numericAmount)} {assetSymbol}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#9A9AA2]">{mode === "supply" ? "Destination" : "Returned to"}</dt><dd className="text-right font-bold text-white">{mode === "supply" ? `${protocol} · ${network}` : "Universal Account"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#9A9AA2]">Estimated fee</dt><dd className="font-mono font-black text-[#ccff00]">{getTotalFeeLabel(transaction)}</dd></div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3"><dt className="text-[#9A9AA2]">Position after</dt><dd className="font-mono font-bold text-white">{formatTokenBalance(estimatedPosition)} {assetSymbol}</dd></div>
            </dl>
            <details className="group mt-4 border-t border-white/10 pt-2">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-1 text-sm font-bold text-[#C8C8CE] focus-visible:ring-2 focus-visible:ring-[#ccff00]">Advanced details<AppIcon icon="lucide:chevron-down" aria-hidden="true" width={17} height={17} className="transition-transform group-open:rotate-180" /></summary>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between"><dt className="text-[#9A9AA2]">Protocol calls</dt><dd className="text-right font-bold capitalize text-white">{callLabel}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9A9AA2]">Network</dt><dd className="font-bold text-white">{network}</dd></div>
                {fundingRows.map((row) => <div key={row.label} className="flex justify-between gap-3"><dt className="text-[#9A9AA2]">Source</dt><dd className="text-right font-mono font-bold text-white">{row.label}</dd></div>)}
                <div className="flex justify-between border-t border-white/10 pt-2.5"><dt className="font-bold text-white">Estimated total fee</dt><dd className="font-mono font-black text-[#ccff00]">{getTotalFeeLabel(transaction)}</dd></div>
                {feeRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-3">
                    <dt className="text-[#9A9AA2]">{row.label}</dt>
                    <dd className="flex items-center justify-end gap-2 font-mono font-bold">
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
                {feeTokenRows.map((row) => <div key={row.label} className="flex justify-between gap-3"><dt className="text-[#9A9AA2]">Fee paid with</dt><dd className="text-right font-mono font-bold text-white">{row.label}</dd></div>)}
                <div className="flex justify-between gap-3 border-t border-white/10 pt-2.5"><dt className="text-[#9A9AA2]">Quote hash</dt><dd className="font-mono font-bold text-white">{truncateAddress(transaction.rootHash, 6)}</dd></div>
              </dl>
            </details>
          </div>
        ) : null}

        {transaction ? (
          <div className="mt-auto pt-6">
            {active.error ? <p className="mb-3 text-center text-xs font-semibold text-red-200" role="alert">{active.error}</p> : null}
            <Button type="submit" color="warning" size="lg" rounded="full" fullWidth label={`Confirm ${actionLabel.toLowerCase()}`} startIcon="solar:check-circle-bold" isLoading={active.isSigning} isDisabled={!validAmount} aria-busy={active.isSigning} />
          </div>
        ) : null}
      </form>
    </motion.section>
  );
}
