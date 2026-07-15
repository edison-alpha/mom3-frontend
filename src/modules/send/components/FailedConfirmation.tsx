"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type FailedConfirmationProps = {
  message: string;
  onRetry: () => void;
  onBack: () => void;
};

export function FailedConfirmation({ message, onRetry, onBack }: FailedConfirmationProps) {
  return (
    <section
      className="send-result-enter mt-8 flex flex-1 flex-col"
      aria-labelledby="send-failed-title"
      role="alert"
    >
      <div className="flex flex-col items-center text-center">
        <span className="send-result-icon flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-400/25">
          <AppIcon icon="icon-park-solid:close-one" aria-hidden="true" width={40} height={40} />
        </span>
        <Typography as="h1" id="send-failed-title" variant="h1" className="mt-5">
          Payment not sent
        </Typography>
        <Typography variant="body-sm" color="muted" align="center" className="mt-2 max-w-xs">
          {message}
        </Typography>
      </div>

      <div className="mt-7 rounded-[28px] bg-[#111217] p-5">
        <div className="flex gap-3">
          <span className="mt-0.5 text-red-400">
            <AppIcon icon="lucide:refresh-cw" aria-hidden="true" width={20} height={20} />
          </span>
          <div>
            <Typography as="h2" variant="label">What you can do</Typography>
            <p className="mt-1 text-sm font-medium leading-6 text-[#9A9AA2]">
              Check your balance and connection, then review the latest transaction details before trying again.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto grid gap-3 pt-6">
        <Button type="button" onClick={onRetry} color="warning" size="xl" fullWidth label="Review and try again" startIcon="lucide:refresh-cw" />
        <Button type="button" onClick={onBack} color="dark" size="lg" fullWidth label="Back to send" startIcon="lucide:arrow-left" />
      </div>
    </section>
  );
}
