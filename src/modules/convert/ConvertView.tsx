"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle, ExternalLink } from "lucide-react";
import { SUPPORTED_TOKEN_TYPE } from "@particle-network/universal-account-sdk";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { Typography } from "@/components/ui/typography";
import {
  getFundingRows,
  sanitizeAmountInput,
} from "@/modules/send/utils/send.utils";
import { getFeeBreakdownRows, getFeeTokenRows, getTotalFeeLabel } from "@/providers/universal-account/services/gas-fee.service";
import { formatUsd } from "@/lib/format";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { useUniversalTransactionStatus } from "@/providers/universal-account/hooks/useUniversalTransactionStatus";
import { useParticleTrade } from "./hooks/useParticleTrade";
import { convertNetworks, getDepositAssetsForChain } from "@/modules/deposit/constants/deposit.constants";

const targetNetworks = convertNetworks
  .map((network) => ({ chainId: network.chainId, label: network.shortName, icon: network.icon }));

export default function ConvertView() {
  const { primaryAssets, isLoading: isAccountLoading } = useUniversalAccount();
  const trade = useParticleTrade();
  const transactionStatus = useUniversalTransactionStatus(trade.transactionId);
  const [amount, setAmount] = React.useState("");
  const [targetChainId, setTargetChainId] = React.useState<number>(targetNetworks[0]?.chainId ?? 101);
  const [targetTokenType, setTargetTokenType] = React.useState<SUPPORTED_TOKEN_TYPE>(SUPPORTED_TOKEN_TYPE.USDC);
  const numericAmount = Number(amount);
  const amountIsValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const unifiedBalance = Number(primaryAssets?.totalAmountInUSD ?? 0);
  const selectedNetwork = targetNetworks.find((network) => network.chainId === targetChainId)!;
  const targetAssets = getDepositAssetsForChain(targetChainId);
  const selectedAsset = targetAssets.find((asset) => asset.type === targetTokenType) ?? targetAssets[0];
  const fundingRows = getFundingRows(trade.transaction);
  const feeRows = getFeeBreakdownRows(trade.transaction);
  const feeTokenRows = getFeeTokenRows(trade.transaction);

  const handlePrepare = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amountIsValid || isAccountLoading) return;
    if (!selectedAsset) return;
    await trade.prepare({ chainId: targetChainId, amount, tokenType: selectedAsset.type as SUPPORTED_TOKEN_TYPE });
  };

  if (trade.status === "success" && trade.transactionId) {
    const activityUrl = `https://universalx.app/activity/details?id=${encodeURIComponent(trade.transactionId)}`;

    return (
      <MobileShell>
        <MobilePageHeader title="Convert" backHref="/dashboard" backLabel="Back to dashboard" />
        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <CheckCircle className="h-10 w-10" aria-hidden="true" />
          </span>
          <Typography as="h2" variant="h1" className="mt-5">
            Conversion submitted
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-2 max-w-xs">
            {transactionStatus.state === "completed"
              ? `${amount} ${selectedAsset?.symbol ?? "token"} is now confirmed on ${selectedNetwork.label}.`
              : transactionStatus.state === "refunded"
                ? "The conversion was refunded. No final conversion was completed."
              : transactionStatus.state === "failed"
                ? "The conversion could not be completed. Open activity details for more information."
                : `Your assets are being converted into ${amount} ${selectedAsset?.symbol ?? "token"} on ${selectedNetwork.label}.`}
          </Typography>
          <span className="mt-4 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-white" aria-live="polite">
            {transactionStatus.state === "completed"
              ? "Completed"
              : transactionStatus.state === "refunded"
                ? "Refunded"
              : transactionStatus.state === "failed"
                ? "Failed"
                : transactionStatus.state === "confirming"
                  ? "Confirming"
                  : "Submitted"}
          </span>
          <a
            href={activityUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none"
          >
            Track activity
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <div className="mt-8 grid w-full grid-cols-2 gap-2">
            <Button variant="dark" size="lg" rounded="full" onClick={trade.reset}>
              Convert again
            </Button>
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#ccff00] px-6 text-base font-medium text-[#16162a] transition-all hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none active:scale-[0.98]"
            >
              Done
            </Link>
          </div>
        </section>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <MobilePageHeader title="Convert" backHref="/assets" backLabel="Back to assets" />

      <form onSubmit={handlePrepare} className="mt-5 flex flex-1 flex-col gap-5">
        <div className="rounded-[24px] bg-[#111217] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Typography variant="label" color="muted">From</Typography>
            <Typography as="p" variant="h3" className="mt-1">Universal balance</Typography>
            </div>
            <AppIcon icon="solar:wallet-money-bold" className="h-6 w-6 text-[#ccff00]" aria-hidden="true" />
          </div>
          <div className="my-4 h-px bg-white/[0.08]" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <Typography variant="label" color="muted">To</Typography>
            <Typography as="p" variant="h3" className="mt-1">{selectedAsset?.name ?? "Token"}</Typography>
            </div>
            <span className="rounded-full bg-[#3B33BD]/20 px-3 py-1.5 text-sm font-black text-[#8F89FF]">{selectedAsset?.symbol ?? "—"}</span>
          </div>
        </div>

        <fieldset className="space-y-2">
          <Typography as="legend" variant="label" color="muted">Receive on</Typography>
          <div className="relative">
            <select
              aria-label="Receive network"
              value={targetChainId}
              onChange={(event) => {
                setTargetChainId(Number(event.target.value));
                trade.reset();
              }}
              className="h-12 w-full appearance-none rounded-2xl bg-[#1C1C1E] px-4 pr-11 text-sm font-bold text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            >
              {targetNetworks.map((network) => (
                <option key={network.chainId} value={network.chainId}>
                  {network.label}
                </option>
              ))}
            </select>
            <AppIcon
              icon="lucide:chevron-down"
              width={18}
              height={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#A7A7B7]"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <Typography as="legend" variant="label" color="muted">Token</Typography>
          <div className="grid grid-cols-2 gap-2">
            {targetAssets.map((asset) => {
              const isSelected = asset.type === selectedAsset?.type;
              return (
                <Button
                  key={asset.id}
                  type="button"
                  variant={isSelected ? "lime" : "dark"}
                  size="lg"
                  rounded="lg"
                  aria-pressed={isSelected}
                  startIcon={<AppIcon icon={asset.icon} width={18} height={18} aria-hidden="true" />}
                  label={asset.symbol}
                  className="w-full px-2"
                  onClick={() => {
                    setTargetTokenType(asset.type as SUPPORTED_TOKEN_TYPE);
                    trade.reset();
                  }}
                />
              );
            })}
          </div>
        </fieldset>

        <div className="rounded-[28px] bg-[#111217] p-5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="convert-amount" className="text-xs font-black uppercase tracking-[0.08em] text-[#9A9AA2]">
              {selectedAsset?.symbol ?? "Token"} to receive
            </label>
            <Typography variant="caption" color="muted">
              Balance {formatUsd(unifiedBalance)}
            </Typography>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <input
              id="convert-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(event) => {
                setAmount(sanitizeAmountInput(event.target.value));
                trade.reset();
              }}
              placeholder="0.00"
              aria-invalid={amount.length > 0 && !amountIsValid ? "true" : undefined}
              aria-describedby="convert-amount-help"
              className="min-w-0 flex-1 bg-transparent font-mono text-4xl font-black tabular-nums text-white outline-none placeholder:text-[#66666D] focus-visible:ring-0"
            />
            <span className="rounded-full bg-[#3B33BD]/20 px-3 py-1.5 text-sm font-black text-[#8F89FF]">
              {selectedAsset?.symbol ?? "—"}
            </span>
          </div>
          <Typography id="convert-amount-help" variant="caption" color={amount.length > 0 && !amountIsValid ? "danger" : "muted"} className="mt-3 block">
            {amount.length > 0 && !amountIsValid
              ? "Enter an amount greater than zero."
              : `Fees and source assets appear after preview.`}
          </Typography>
        </div>

        {trade.error ? (
          <div className="rounded-2xl bg-red-500/10 p-4" role="alert">
            <Typography variant="body-sm" color="danger">
              {trade.error}
            </Typography>
            <Button type="button" variant="danger" size="sm" rounded="full" className="mt-3" onClick={trade.reset}>
              Try again
            </Button>
          </div>
        ) : null}

        {trade.transaction ? (
          <div className="space-y-4 rounded-[24px] bg-[#1C1C1E] p-4">
            <div className="flex items-center justify-between gap-3">
              <Typography as="h3" variant="h3">
                Review route
              </Typography>
              <Typography variant="label" color="accent">
                {getTotalFeeLabel(trade.transaction)} fees
              </Typography>
            </div>

            <div className="space-y-2">
              {fundingRows.map((row) => (
                <div key={`${row.label}-${row.value}`} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-[#A7A7B7]">From {row.label}</span>
                  <span className="font-mono tabular-nums text-white">{row.value}</span>
                </div>
              ))}
              {feeRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[#A7A7B7]">{row.label}</span>
                  <span className="flex items-center justify-end gap-2 font-mono tabular-nums">
                    {row.originalValue ? (
                      <span className="text-[#77777F] line-through decoration-[#77777F]">
                        {row.originalValue}
                      </span>
                    ) : null}
                    <span className={row.originalValue ? "font-bold text-[#ccff00]" : "text-white"}>
                      {row.value}
                    </span>
                  </span>
                </div>
              ))}
              {feeTokenRows.map((row) => (
                <div key={`fee-token-${row.label}`} className="flex items-start justify-between gap-4 border-t border-white/[0.06] pt-2 text-sm">
                  <span className="text-[#A7A7B7]">Fee token</span>
                  <span className="text-right font-mono text-xs font-bold tabular-nums text-white">{row.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-black/25 p-3">
              <span className="text-sm font-bold text-[#A7A7B7]">You receive</span>
              <span className="font-mono text-sm font-black tabular-nums text-white">
                {amount} {selectedAsset?.symbol ?? "token"} · {selectedNetwork.label}
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-4 pt-1">
          {trade.transaction ? (
            <Button
              type="button"
              variant="lime"
              size="xl"
              rounded="full"
              fullWidth
              isLoading={trade.isSigning}
              label={trade.isSigning ? "Waiting for signature" : "Confirm conversion"}
              startIcon="lucide:check-circle"
              onClick={() => void trade.execute()}
            />
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="xl"
              rounded="full"
              fullWidth
              isLoading={trade.isPreparing}
              isDisabled={!amountIsValid || isAccountLoading}
              label={trade.isPreparing ? "Finding the best route" : "Preview conversion"}
              startIcon="lucide:arrow-right"
            />
          )}
        </div>
      </form>
    </MobileShell>
  );
}
