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
import {
  getFeeBreakdownRows,
  getFeeTokenRows,
  getTotalFeeLabel,
} from "@/providers/universal-account/services/gas-fee.service";
import { formatUsd } from "@/lib/format";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { useUniversalTransactionStatus } from "@/providers/universal-account/hooks/useUniversalTransactionStatus";
import { useParticleTrade } from "./hooks/useParticleTrade";
import { ConvertBottomSheet } from "./components/ConvertBottomSheet";
import {
  convertNetworks,
  getDepositAssetsForChain,
} from "@/modules/deposit/constants/deposit.constants";

const targetNetworks = convertNetworks
  .filter((network) => [1, 56, 8453, 42161, 101].includes(network.chainId))
  .map((network) => ({
    chainId: network.chainId,
    label: network.shortName,
    icon: network.icon,
  }));

// Stablecoins are always priced at $1 — ETH/SOL derive their price from the
// unified balance assets (amountInUSD / amount).
const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT"]);

export default function ConvertView() {
  const { primaryAssets, isLoading: isAccountLoading } = useUniversalAccount();
  const trade = useParticleTrade();
  const transactionStatus = useUniversalTransactionStatus(trade.transactionId);

  const [amount, setAmount] = React.useState("");
  const [targetChainId, setTargetChainId] = React.useState<number>(
    targetNetworks[0]?.chainId ?? 101,
  );
  const [targetTokenType, setTargetTokenType] =
    React.useState<SUPPORTED_TOKEN_TYPE>(SUPPORTED_TOKEN_TYPE.USDC);
  const [sheet, setSheet] = React.useState<"network" | "token" | null>(null);

  const usdAmount = Number(amount);
  const amountIsValid = Number.isFinite(usdAmount) && usdAmount > 0;
  const unifiedBalance = Number(primaryAssets?.totalAmountInUSD ?? 0);

  const selectedNetwork = targetNetworks.find(
    (network) => network.chainId === targetChainId,
  )!;
  const targetAssets = getDepositAssetsForChain(targetChainId);
  const selectedAsset =
    targetAssets.find((asset) => asset.type === targetTokenType) ??
    targetAssets[0];

  const fundingRows = getFundingRows(trade.transaction);
  const feeRows = getFeeBreakdownRows(trade.transaction);
  const feeTokenRows = getFeeTokenRows(trade.transaction);

  // Derive the selected token's USD price from the unified balance assets.
  // Stablecoins are always $1; ETH/SOL use amountInUSD / amount from any held
  // position. Falls back to $1 (safest for stablecoin-dominant wallets).
  const tokenPrice = React.useMemo(() => {
    if (!selectedAsset) return 1;
    if (STABLECOIN_SYMBOLS.has(selectedAsset.symbol)) return 1;
    const held = primaryAssets?.assets?.find(
      (asset) => String(asset.tokenType).toUpperCase() === selectedAsset.symbol,
    );
    if (!held) return 1;
    const tokenAmount = Number(held.amount);
    const amountUsd = Number(held.amountInUSD);
    if (!Number.isFinite(tokenAmount) || tokenAmount <= 0) return 1;
    const price = amountUsd / tokenAmount;
    return Number.isFinite(price) && price > 0 ? price : 1;
  }, [primaryAssets, selectedAsset]);

  // Display estimate: how many tokens the user receives for the USD amount.
  const receiveEstimate = amountIsValid ? usdAmount / tokenPrice : 0;

  const setMaxAmount = () => {
    setAmount(unifiedBalance > 0 ? unifiedBalance.toFixed(2) : "");
    trade.reset();
  };

  const handlePrepare = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amountIsValid || isAccountLoading || !selectedAsset) return;
    // Particle's expectToken.amount is a token amount, not USD.
    const tokenAmount = (usdAmount / tokenPrice).toFixed(6);
    await trade.prepare({
      chainId: targetChainId,
      amount: tokenAmount,
      tokenType: selectedAsset.type as SUPPORTED_TOKEN_TYPE,
    });
  };

  const selectNetwork = (chainId: number) => {
    setTargetChainId(chainId);
    setSheet(null);
    trade.reset();
  };

  const selectToken = (type: SUPPORTED_TOKEN_TYPE) => {
    setTargetTokenType(type);
    setSheet(null);
    trade.reset();
  };

  if (trade.status === "success" && trade.transactionId) {
    const activityUrl = `https://universalx.app/activity/details?id=${encodeURIComponent(trade.transactionId)}`;

    return (
      <MobileShell>
        <MobilePageHeader
          title="Convert"
          backHref="/dashboard"
          backLabel="Back to dashboard"
        />
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
          <span
            className="mt-4 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-white"
            aria-live="polite"
          >
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
            <Button
              variant="dark"
              size="lg"
              rounded="full"
              onClick={trade.reset}
            >
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
      <MobilePageHeader
        title="Convert"
        backHref="/assets"
        backLabel="Back to assets"
        action={
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label="Select network"
            onClick={() => setSheet("network")}
            className="flex items-center gap-1.5 rounded-full bg-[#1C1C1E] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none"
          >
            <AppIcon
              icon={selectedNetwork.icon}
              width={16}
              height={16}
              aria-hidden="true"
            />
            <span>{selectedNetwork.label}</span>
            <AppIcon
              icon="lucide:chevron-down"
              width={14}
              height={14}
              aria-hidden="true"
              className="text-[#A7A7B7]"
            />
          </button>
        }
      />

      <form onSubmit={handlePrepare} className="mt-4 flex flex-1 flex-col">
        {/* You pay */}
        <div className="rounded-3xl bg-[#111217] p-4">
          <Typography variant="label" color="muted">
            You pay
          </Typography>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-black text-white">$</span>
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
              placeholder="0"
              aria-invalid={
                amount.length > 0 && !amountIsValid ? "true" : undefined
              }
              className="min-w-0 flex-1 bg-transparent font-mono text-4xl font-black tabular-nums text-white outline-none placeholder:text-[#3A3A42] focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={setMaxAmount}
              className="rounded-full bg-white/[0.08] px-2.5 py-1 text-xs font-black text-white transition-colors hover:bg-white/[0.14] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none"
            >
              MAX
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <Typography
              variant="caption"
              color={
                amount.length > 0 && !amountIsValid ? "danger" : "muted"
              }
            >
              {amount.length > 0 && !amountIsValid
                ? "Enter an amount greater than zero."
                : `Balance ${formatUsd(unifiedBalance)}`}
            </Typography>
          </div>
        </div>

        {/* Switch divider */}
        <div className="relative z-10 -my-3 flex justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-black bg-[#1C1C1E]">
            <AppIcon
              icon="lucide:arrow-down"
              width={16}
              height={16}
              aria-hidden="true"
              className="text-white"
            />
          </span>
        </div>

        {/* You receive */}
        <div className="rounded-3xl bg-[#111217] p-4">
          <Typography variant="label" color="muted">
            You receive
          </Typography>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span
              className={`min-w-0 flex-1 truncate font-mono text-4xl font-black tabular-nums ${receiveEstimate > 0 ? "text-white" : "text-[#3A3A42]"}`}
              aria-live="polite"
            >
              {receiveEstimate > 0
                ? receiveEstimate.toLocaleString("en-US", {
                    maximumFractionDigits: 6,
                  })
                : "0"}
            </span>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label="Select token"
              onClick={() => setSheet("token")}
              className="flex shrink-0 items-center gap-2 rounded-full bg-[#1C1C1E] py-2 pl-2 pr-3 transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none"
            >
              <AppIcon
                icon={selectedAsset?.icon ?? ""}
                width={22}
                height={22}
                aria-hidden="true"
              />
              <span className="text-sm font-black text-white">
                {selectedAsset?.symbol ?? "—"}
              </span>
              <AppIcon
                icon="lucide:chevron-down"
                width={14}
                height={14}
                aria-hidden="true"
                className="text-[#A7A7B7]"
              />
            </button>
          </div>
          <div className="mt-2">
            <Typography variant="caption" color="muted">
              ≈ {formatUsd(receiveEstimate * tokenPrice)} on{" "}
              {selectedNetwork.label}
            </Typography>
          </div>
        </div>

        {trade.error ? (
          <div className="mt-4 rounded-2xl bg-red-500/10 p-4" role="alert">
            <Typography variant="body-sm" color="danger">
              {trade.error}
            </Typography>
            <Button
              type="button"
              variant="danger"
              size="sm"
              rounded="full"
              className="mt-3"
              onClick={trade.reset}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {trade.transaction ? (
          <div className="mt-4 space-y-4 rounded-3xl bg-[#1C1C1E] p-4">
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
                <div
                  key={`${row.label}-${row.value}`}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <span className="text-[#A7A7B7]">From {row.label}</span>
                  <span className="font-mono tabular-nums text-white">
                    {row.value}
                  </span>
                </div>
              ))}
              {feeRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-[#A7A7B7]">{row.label}</span>
                  <span className="flex items-center justify-end gap-2 font-mono tabular-nums">
                    {row.originalValue ? (
                      <span className="text-[#77777F] line-through decoration-[#77777F]">
                        {row.originalValue}
                      </span>
                    ) : null}
                    <span
                      className={
                        row.originalValue
                          ? "font-bold text-[#ccff00]"
                          : "text-white"
                      }
                    >
                      {row.value}
                    </span>
                  </span>
                </div>
              ))}
              {feeTokenRows.map((row) => (
                <div
                  key={`fee-token-${row.label}`}
                  className="flex items-start justify-between gap-4 border-t border-white/[0.06] pt-2 text-sm"
                >
                  <span className="text-[#A7A7B7]">Fee token</span>
                  <span className="text-right font-mono text-xs font-bold tabular-nums text-white">
                    {row.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-black/25 p-3">
              <span className="text-sm font-bold text-[#A7A7B7]">
                You receive
              </span>
              <span className="font-mono text-sm font-black tabular-nums text-white">
                {receiveEstimate.toLocaleString("en-US", {
                  maximumFractionDigits: 6,
                })}{" "}
                {selectedAsset?.symbol ?? "token"} · {selectedNetwork.label}
              </span>
            </div>
          </div>
        ) : null}

        {/* CTA pinned to bottom */}
        <div className="mt-auto pt-4">
          {trade.transaction ? (
            <Button
              type="button"
              variant="lime"
              size="xl"
              rounded="full"
              fullWidth
              isLoading={trade.isSigning}
              label={
                trade.isSigning ? "Waiting for signature" : "Confirm conversion"
              }
              startIcon="lucide:check-circle"
              onClick={() => void trade.execute()}
            />
          ) : (
            <Button
              type="submit"
              variant="lime"
              size="xl"
              rounded="full"
              fullWidth
              isLoading={trade.isPreparing}
              isDisabled={!amountIsValid || isAccountLoading}
              label={trade.isPreparing ? "Finding the best route" : "Preview"}
            />
          )}
        </div>
      </form>

      {/* Network picker bottom sheet */}
      <ConvertBottomSheet
        isOpen={sheet === "network"}
        onClose={() => setSheet(null)}
        title="Select network"
      >
        <div className="space-y-1">
          {targetNetworks.map((network) => {
            const isSelected = network.chainId === targetChainId;
            return (
              <button
                key={network.chainId}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectNetwork(network.chainId)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none ${
                  isSelected
                    ? "bg-[#ccff00] text-[#16162a]"
                    : "text-white hover:bg-white/[0.08]"
                }`}
              >
                <AppIcon
                  icon={network.icon}
                  width={22}
                  height={22}
                  aria-hidden="true"
                />
                <span className="flex-1">{network.label}</span>
                {isSelected ? (
                  <AppIcon
                    icon="lucide:check"
                    width={17}
                    height={17}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </ConvertBottomSheet>

      {/* Token picker bottom sheet */}
      <ConvertBottomSheet
        isOpen={sheet === "token"}
        onClose={() => setSheet(null)}
        title="Select token"
      >
        <div className="space-y-1">
          {targetAssets.map((asset) => {
            const isSelected = asset.type === selectedAsset?.type;
            return (
              <button
                key={asset.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectToken(asset.type as SUPPORTED_TOKEN_TYPE)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none ${
                  isSelected
                    ? "bg-[#ccff00] text-[#16162a]"
                    : "text-white hover:bg-white/[0.08]"
                }`}
              >
                <AppIcon
                  icon={asset.icon}
                  width={26}
                  height={26}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black">
                    {asset.symbol}
                  </span>
                  <span
                    className={`block truncate text-xs ${isSelected ? "text-[#16162a]/70" : "text-[#A7A7B7]"}`}
                  >
                    {asset.name}
                  </span>
                </span>
                {isSelected ? (
                  <AppIcon
                    icon="lucide:check"
                    width={17}
                    height={17}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </ConvertBottomSheet>
    </MobileShell>
  );
}
