"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import * as React from "react";

export function ScanModal({
  open,
  onClose,
  onScan,
}: {
  open: boolean;
  onClose: () => void;
  onScan: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-5 backdrop-blur-sm sm:items-center sm:justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-wallet-title"
        className="mx-auto w-full max-w-md rounded-[32px] bg-[#1C1C1E] p-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="scan-wallet-title" className="text-base font-black text-white">
            Scan wallet QR
          </h2>
          <Button
            type="button"
            onClick={onClose}
            color="transparent"
            size="icon"
            rounded="full"
            startIcon="lucide:x"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-[#9A9AA2] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
            aria-label="Close scanner"
          />
        </div>
        <div className="mt-5 flex aspect-square items-center justify-center rounded-[28px] border border-[#3B33BD]/50 bg-black">
          <div className="relative h-48 w-48 rounded-[24px] border-2 border-[#ccff00]">
            <div className="absolute left-5 top-5 h-8 w-8 border-l-4 border-t-4 border-white" />
            <div className="absolute right-5 top-5 h-8 w-8 border-r-4 border-t-4 border-white" />
            <div className="absolute bottom-5 left-5 h-8 w-8 border-b-4 border-l-4 border-white" />
            <div className="absolute bottom-5 right-5 h-8 w-8 border-b-4 border-r-4 border-white" />
            <div className="absolute inset-x-6 top-1/2 h-0.5 bg-[#ccff00] shadow-[0_0_18px_rgba(204,255,0,0.8)]" />
          </div>
        </div>
        <Button
          type="button"
          onClick={onScan}
          color="primary"
          label="Use scanned wallet"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#3B33BD] text-base font-black text-[#ccff00] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
        />
      </div>
    </div>
  );
}
