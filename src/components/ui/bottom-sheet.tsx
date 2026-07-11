"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  closeLabel?: string;
};

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  closeLabel = "Close",
}: BottomSheetProps) {
  const titleId = React.useId();
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <motion.button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={() => onOpenChange(false)}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[32px] border-t border-white/10 bg-[#111217] px-4 pb-6 pt-3 shadow-[0_-24px_64px_-24px_rgba(0,0,0,0.9)]",
          className,
        )}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.85 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 700) {
            onOpenChange(false);
          }
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring", damping: 30, stiffness: 320 }
        }
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20" />

        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="text-lg font-black text-white">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm font-medium text-[#9A9AA2]">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={closeLabel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          >
            <AppIcon icon="lucide:x" aria-hidden="true" width={18} height={18} />
          </button>
        </div>

        <div className={cn("mt-5", contentClassName)}>{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </motion.div>
    </div>
  );
}
