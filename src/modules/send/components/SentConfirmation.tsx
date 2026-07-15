"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { formatTokenBalance } from "@/lib/format";
import { truncateAddress } from "@/utils/address.utils";
import { useUniversalTransactionStatus } from "@/providers/universal-account/hooks/useUniversalTransactionStatus";

type SentConfirmationProps = {
  amount: string;
  tokenSymbol: string;
  chainName: string;
  recipientName: string;
  recipientAddress: string;
  transactionId: string;
  feeLabel: string;
  onSendAgain: () => void;
  onBack: () => void;
};

export function SentConfirmation({
  amount,
  tokenSymbol,
  chainName,
  recipientName,
  recipientAddress,
  transactionId,
  feeLabel,
  onSendAgain,
  onBack,
}: SentConfirmationProps) {
  const transactionStatus = useUniversalTransactionStatus(transactionId);
  const statusLabel =
    transactionStatus.state === "completed"
      ? "Completed"
      : transactionStatus.state === "failed"
        ? "Failed"
        : transactionStatus.state === "confirming"
          ? "Confirming"
          : "Submitted";

  return (
    <section className="send-result-enter mt-8 flex flex-1 flex-col" aria-labelledby="send-success-title" role="status">
      <div className="flex flex-col items-center text-center">
        <span className="send-result-icon flex h-20 w-20 items-center justify-center rounded-full bg-[#ccff00]/15 text-[#ccff00] ring-1 ring-[#ccff00]/30">
          <AppIcon icon="icon-park-solid:success" aria-hidden="true" width={42} height={42} />
        </span>
        <Typography
          as="h1"
          id="send-success-title"
          variant="h1"
          className="mt-5"
        >
          Payment sent
        </Typography>
        <Typography variant="body-sm" color="muted" align="center" className="mt-2 max-w-xs">
          {transactionStatus.state === "completed"
            ? "Your payment is confirmed on-chain."
            : transactionStatus.state === "failed"
              ? "The transaction could not be completed. Open the activity details for more information."
              : "Your payment was submitted and is being confirmed on-chain."}
        </Typography>
      </div>

      <div className="mt-7 rounded-[28px] bg-[#111217] p-5">
        <Typography variant="label" color="muted" align="center">
          Amount sent
        </Typography>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="font-mono text-4xl font-black tabular-nums text-white">
            {formatTokenBalance(Number(amount))}
          </span>
          <span className="text-xl font-black text-[#ccff00]">{tokenSymbol}</span>
        </div>

        <dl className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#9A9AA2]">Status</dt>
            <dd className="font-bold text-white" aria-live="polite">{statusLabel}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-[#9A9AA2]">To</dt>
            <dd className="min-w-0 text-right font-bold text-white">
              <span className="block truncate">{recipientName}</span>
              <span className="mt-0.5 block font-mono text-xs text-[#9A9AA2]">
                {truncateAddress(recipientAddress, 5)}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#9A9AA2]">Network</dt>
            <dd className="font-bold text-white">{chainName}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#9A9AA2]">Total fee</dt>
            <dd className="font-mono font-bold tabular-nums text-white">{feeLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#9A9AA2]">Transaction ID</dt>
            <dd className="font-mono text-xs font-bold text-white">
              {truncateAddress(transactionId, 6)}
            </dd>
          </div>
        </dl>

        <a
          href={`https://universalx.app/activity/details?id=${transactionId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 text-sm font-bold text-white transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
        >
          View transaction details
          <AppIcon icon="lucide:external-link" aria-hidden="true" width={16} height={16} />
        </a>
      </div>

      <div className="mt-auto grid gap-3 pt-6">
        <Button
          type="button"
          onClick={onSendAgain}
          color="warning"
          size="xl"
          fullWidth
          label="Send again"
          startIcon="lucide:send"
        />
        <Button
          type="button"
          onClick={onBack}
          color="dark"
          size="lg"
          fullWidth
          label="Back to dashboard"
          startIcon="lucide:arrow-left"
        />
      </div>
    </section>
  );
}
