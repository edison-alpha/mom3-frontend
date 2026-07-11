"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";

type ProfileLogoutSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ProfileLogoutSheet({
  open,
  onOpenChange,
  onConfirm,
}: ProfileLogoutSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Log out?"
      description="Your wallet session will be ended on this device."
      closeLabel="Close logout confirmation"
      contentClassName="space-y-3"
    >
      <button
        type="button"
        onClick={onConfirm}
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#3B33BD] text-base font-bold text-white transition-colors hover:bg-[#4940d1] focus-visible:ring-2 focus-visible:ring-[#ccff00]"
      >
        Log out
      </button>
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="flex h-12 w-full items-center justify-center rounded-full border border-white/10 bg-[#1C1C1E] text-base font-bold text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
      >
        Cancel
      </button>
    </BottomSheet>
  );
}
