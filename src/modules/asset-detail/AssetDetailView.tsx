"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { formatTokenBalance, formatUsd, formatUsdValue } from "@/lib/format";
import { tokenIcon } from "@/lib/chain";
import { normalizePrimaryAssetTokens } from "@/modules/send/utils/send.utils";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import Link from "next/link";
import * as React from "react";

function AssetDetailSkeleton() {
  return <MobileShell><SkeletonText className="mt-6 h-6 w-28" /><section className="mt-5 rounded-[28px] bg-[#111217] p-5"><Skeleton className="mx-auto h-14 w-14 rounded-full" /><SkeletonText className="mx-auto mt-4 h-8 w-36" /><SkeletonText className="mx-auto mt-3 h-12 w-48" /><div className="mt-6 grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div></section></MobileShell>;
}

export default function AssetDetailView({ symbol }: { symbol: string }) {
  const { primaryAssets, isLoading } = useUniversalAccount();
  const tokens = React.useMemo(() => normalizePrimaryAssetTokens(primaryAssets, true), [primaryAssets]);
  const token = tokens.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase() || item.id.toLowerCase() === symbol.toLowerCase());

  if (isLoading && !primaryAssets) return <AssetDetailSkeleton />;
  if (!token) return <MobileShell><MobilePageHeader title="Asset unavailable" backHref="/assets" backLabel="Back to assets" /><section className="mt-8 rounded-[24px] border border-white/10 bg-[#111217] p-6 text-center"><AppIcon icon="solar:wallet-bold" className="mx-auto h-8 w-8 text-[#8F89FF]" aria-hidden="true" /><p className="mt-3 text-sm font-black text-white">This token is not in your wallet</p><p className="mt-1 text-xs text-[#A7A7B7]">Refresh your portfolio or deposit this asset before opening its details.</p><Link href="/assets" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#ccff00] px-5 text-sm font-black text-[#16162a] focus-visible:ring-2 focus-visible:ring-[#ccff00]">Back to portfolio</Link></section></MobileShell>;

  const value = Number(token.amountInUSD || 0);
  const totalValue = Number(primaryAssets?.totalAmountInUSD || 0);
  const price = token.balance > 0 ? value / token.balance : 0;
  const chart = Array.from({ length: 7 }, () => value);

  return <MobileShell>
    <MobilePageHeader title={token.symbol} backHref="/assets" backLabel="Back to assets" />
    <section className="mt-5 rounded-[28px] border border-white/10 bg-[#111217] p-5">
      <div className="flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.08]"><AppIcon icon={token.icon || tokenIcon(token.symbol)} className="h-8 w-8" aria-hidden="true" /></span><div><h2 className="text-lg font-black text-white">{token.name}</h2><p className="mt-1 text-xs font-medium text-[#A7A7B7]">{token.chainName} · live wallet balance</p></div></div>
      <p className="mt-6 text-4xl font-black tracking-tight text-white">{formatUsdValue(value)}</p>
      <p className="mt-1 text-sm font-medium text-[#A7A7B7]">{formatTokenBalance(token.balance)} {token.symbol}</p>
      <div className="mt-5 h-20 rounded-2xl bg-[#3B33BD]/15 p-3" aria-label="Current token value history is not available from wallet data"><div className="flex h-full items-end gap-1">{chart.map((_, index) => <span key={index} className="flex-1 rounded-t bg-[#8F89FF]/70" style={{ height: `${Math.max(20, value ? 60 + index * 4 : 20)}%` }} />)}</div></div>
      <p className="mt-2 text-[11px] text-[#8F8F96]">Price data: {price ? formatUsd(price) : "Unavailable"}. Historical market price will appear when the price indexer is connected.</p>
    </section>
    <section className="mt-3 grid grid-cols-2 gap-3">{[["Balance", `${formatTokenBalance(token.balance)} ${token.symbol}`], ["Value", formatUsdValue(value)], ["Network", token.chainName], ["Allocation", value > 0 && totalValue > 0 ? `${((value / totalValue) * 100).toFixed(1)}%` : "0%"]].map(([label, content]) => <div key={label} className="rounded-[18px] border border-white/10 bg-[#111217] p-3"><p className="text-xs text-[#A7A7B7]">{label}</p><p className="mt-1.5 truncate text-sm font-black text-white">{content}</p></div>)}</section>
    <div className="mt-4 grid grid-cols-2 gap-3"><Link href={`/send?asset=${encodeURIComponent(token.symbol)}&chain=${encodeURIComponent(token.chainName)}`} className="flex min-h-12 items-center justify-center rounded-full bg-[#ccff00] text-sm font-black text-[#16162a] focus-visible:ring-2 focus-visible:ring-[#ccff00]">Send asset</Link><Link href="/deposit" className="flex min-h-12 items-center justify-center rounded-full bg-[#1C1C1E] text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-[#3B33BD]">Deposit</Link></div>
  </MobileShell>;
}
