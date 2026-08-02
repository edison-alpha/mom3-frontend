"use client";

import * as React from "react";

import { Typography } from "@/components/ui/typography";
import { AppIcon } from "@/components/ui/app-icon";

type ConvertBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function ConvertBottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: ConvertBottomSheetProps) {
  // Close on Escape for keyboard users; the backdrop click covers pointers.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[75dvh] overflow-y-auto rounded-t-3xl bg-[#111217] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/[0.16]" aria-hidden="true" />
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <Typography as="h3" variant="h3">
            {title}
          </Typography>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-white transition-colors hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
          >
            <AppIcon icon="lucide:x" width={16} height={16} aria-hidden="true" />
          </button>
        </div>
        <div className="px-4">{children}</div>
      </div>
    </div>
  );
}
