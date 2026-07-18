"use client";

import * as React from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  CircleAlert,
  Copy,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { Typography } from "@/components/ui/typography";
import {
  depositNetworks,
  getDepositAssetsForChain,
} from "@/modules/deposit/constants/deposit.constants";
import { DepositSkeleton } from "@/modules/deposit/components/DepositSkeleton";
import { useDepositMonitor } from "@/modules/deposit/hooks/useDepositMonitor";
import { truncateDepositAddress } from "@/modules/deposit/utils/deposit.utils";
import { formatTokenBalance } from "@/lib/format";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";

const DEFAULT_CHAIN_ID = depositNetworks[0].chainId;

export default function DepositView() {
  const {
    accountInfo,
    primaryAssets,
    isLoading,
    error,
    refreshAccount,
  } = useUniversalAccount();
  const [selectedChainId, setSelectedChainId] = React.useState(DEFAULT_CHAIN_ID);
  const availableAssets = React.useMemo(
    () => getDepositAssetsForChain(selectedChainId),
    [selectedChainId],
  );
  const [selectedAssetId, setSelectedAssetId] = React.useState(
    () => getDepositAssetsForChain(DEFAULT_CHAIN_ID)[0]?.id ?? "",
  );
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">("idle");

  const selectedNetwork =
    depositNetworks.find((network) => network.chainId === selectedChainId) ??
    depositNetworks[0];
  const selectedAsset =
    availableAssets.find((asset) => asset.id === selectedAssetId) ?? availableAssets[0];
  const depositAddress =
    selectedNetwork.kind === "solana"
      ? accountInfo.solanaSmartAccount
      : accountInfo.evmSmartAccount;

  const monitor = useDepositMonitor({
    primaryAssets,
    selectedAsset,
    refreshAccount,
  });

  React.useEffect(() => {
    if (availableAssets.some((asset) => asset.id === selectedAssetId)) return;
    setSelectedAssetId(availableAssets[0]?.id ?? "");
  }, [availableAssets, selectedAssetId]);

  React.useEffect(() => {
    if (copyState === "idle") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 2_000);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const handleCopy = async () => {
    if (!depositAddress) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(depositAddress);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = depositAddress;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  if (isLoading && !primaryAssets) {
    return <DepositSkeleton />;
  }

  return (
    <MobileShell className="overflow-x-hidden">
      <MobilePageHeader title="Deposit" backHref="/dashboard" backLabel="Back to dashboard" />

      <section className="mt-4 space-y-4 pb-2">
        <div>
          <Typography as="h2" variant="h1" balance>
            Add funds to your balance.
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-2">
            Choose a network and token, then send it to the address below.
          </Typography>
        </div>

        <fieldset className="space-y-2">
          <Typography as="legend" variant="label" color="muted">
            Deposit network
          </Typography>
          <div className="-mx-5 flex min-w-0 max-w-[calc(100%+2.5rem)] gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {depositNetworks.map((network) => {
              const isSelected = network.chainId === selectedChainId;

              return (
                <Button
                  key={network.chainId}
                  type="button"
                  variant={isSelected ? "lime" : "dark"}
                  size="lg"
                  rounded="full"
                  aria-pressed={isSelected}
                  startIcon={<AppIcon icon={network.icon} width={20} height={20} aria-hidden="true" />}
                  label={network.shortName}
                  className="shrink-0"
                  onClick={() => setSelectedChainId(network.chainId)}
                />
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <Typography as="legend" variant="label" color="muted">
            Asset
          </Typography>
          <div className="grid grid-cols-2 gap-2">
            {availableAssets.map((asset) => {
              const isSelected = asset.id === selectedAsset.id;

              return (
                <Button
                  key={asset.id}
                  type="button"
                  variant={isSelected ? "primary" : "subtle"}
                  size="lg"
                  rounded="lg"
                  aria-pressed={isSelected}
                  startIcon={<AppIcon icon={asset.icon} width={20} height={20} aria-hidden="true" />}
                  label={asset.symbol}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className="w-full"
                />
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <div className="rounded-2xl bg-red-500/10 p-4" role="alert">
            <div className="flex items-center gap-2 text-red-200">
              <CircleAlert className="h-4 w-4" aria-hidden="true" />
              <Typography variant="body-sm" color="danger">
                Could not refresh your wallet balance.
              </Typography>
            </div>
            <Typography variant="caption" color="muted" className="mt-1 block">
              {error}
            </Typography>
            <Button
              type="button"
              variant="danger"
              size="sm"
              rounded="full"
              className="mt-3"
              label="Try again"
              onClick={() => void monitor.refresh()}
            />
          </div>
        ) : null}

        <div className="rounded-[28px] bg-[#111217] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Typography variant="label" color="accent">
                {selectedAsset.symbol} on {selectedNetwork.name}
              </Typography>
              <Typography variant="caption" color="muted" className="mt-1 block">
                Universal deposit address
              </Typography>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ccff00]/10 text-[#ccff00]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          {depositAddress ? (
            <>
              <div className="mx-auto mt-4 w-fit max-w-full overflow-hidden rounded-3xl bg-white p-2.5">
                <QRCodeSVG
                  value={depositAddress}
                  size={156}
                  level="M"
                  marginSize={1}
                  title={`${selectedNetwork.name} deposit address`}
                />
              </div>

              <button
                type="button"
                onClick={() => void handleCopy()}
                className="mt-5 flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-black/30 px-4 text-left transition-colors hover:bg-black/45 focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:outline-none"
                aria-label={`Copy ${selectedNetwork.name} deposit address ${depositAddress}`}
              >
                <span className="min-w-0 font-mono text-sm tabular-nums text-white">
                  {truncateDepositAddress(depositAddress)}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#ccff00]">
                  {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy"}
                </span>
              </button>
            </>
          ) : (
            <div className="mt-5 rounded-2xl bg-red-500/10 p-4" role="alert">
              <Typography variant="body-sm" color="danger">
                This wallet address is not ready. Reconnect your wallet and try again.
              </Typography>
            </div>
          )}

          <div className="mt-4 flex gap-3 rounded-2xl bg-amber-400/10 p-3 text-amber-100">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <Typography variant="caption" color="inherit">
              Send only {selectedAsset.symbol} on {selectedNetwork.name} to avoid losing the deposit.
            </Typography>
          </div>
        </div>

        <div className="rounded-[24px] bg-[#1C1C1E] p-4" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Typography variant="label" color={monitor.status === "received" ? "success" : "primary"}>
                {monitor.status === "received" ? "Deposit detected" : monitor.status === "watching" ? "Watching for deposit" : "Starting monitor"}
              </Typography>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black tabular-nums text-white">
                  {formatTokenBalance(monitor.currentBalance)}
                </span>
                <Typography as="span" variant="body-sm" color="muted">
                  {selectedAsset.symbol}
                </Typography>
              </div>
              <Typography variant="caption" color="muted" className="mt-1 block">
                {monitor.status === "received"
                  ? `+${formatTokenBalance(monitor.receivedAmount)} ${selectedAsset.symbol} added to your universal balance.`
                  : monitor.lastCheckedAt
                    ? `Last checked ${monitor.lastCheckedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Updates automatically.`
                    : "Reading your current balance before monitoring."}
              </Typography>
            </div>
            <Button
              type="button"
              variant={monitor.status === "received" ? "success" : "subtle"}
              size="icon-lg"
              rounded="full"
              aria-label={monitor.status === "received" ? "Monitor another deposit" : "Refresh deposit balance"}
              title={monitor.status === "received" ? "Monitor another deposit" : "Refresh balance"}
              isLoading={monitor.isRefreshing}
              onClick={() => {
                if (monitor.status === "received") monitor.monitorNextDeposit();
                else void monitor.refresh();
              }}
            >
              {monitor.status === "received" ? <Check className="h-5 w-5" aria-hidden="true" /> : <RefreshCw className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] bg-[#111217] p-4">
          <Typography as="h2" variant="h3">
            One balance, three actions
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Use your balance to send or convert.
          </Typography>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/send"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1C1C1E] px-6 text-base font-medium text-white transition-all hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD] focus-visible:outline-none active:scale-[0.98]"
            >
              Send
            </Link>
            <Link
              href="/convert"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3B33BD] px-6 text-base font-medium text-white transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3B33BD] focus-visible:outline-none active:scale-[0.98]"
            >
              Convert
            </Link>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
