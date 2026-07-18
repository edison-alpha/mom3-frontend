"use client";

import { generateAvatarURL } from "@cfx-kit/wallet-avatar";
import * as React from "react";

import { cn } from "@/lib/utils";

type WalletAvatarSize = "sm" | "md" | "lg" | "xl";

type WalletAvatarProps = {
  address?: string;
  imageUrl?: string | null;
  label?: string;
  fallback?: string;
  size?: WalletAvatarSize;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
};

const sizeClassName: Record<WalletAvatarSize, string> = {
  sm: "h-10 w-10",
  md: "h-11 w-11",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const fallbackTextClassName: Record<WalletAvatarSize, string> = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
  xl: "text-2xl",
};

export function WalletAvatar({
  address,
  imageUrl,
  label = "Wallet",
  fallback,
  size = "md",
  className,
  fallbackClassName,
  imageClassName,
}: WalletAvatarProps) {
  const avatarUrl = React.useMemo(
    () => (address ? generateAvatarURL(address) : null),
    [address],
  );
  const fallbackLabel = fallback?.trim().slice(0, 1).toUpperCase() || "W";

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1C1C1E] text-white ring-1 ring-white/10",
        sizeClassName[size],
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#3B33BD] via-[#5A52D4] to-[#7E78EA] font-black",
          fallbackTextClassName[size],
          fallbackClassName,
        )}
        aria-hidden="true"
      >
        {fallbackLabel}
      </span>
      {imageUrl || avatarUrl ? (
        <img
          src={imageUrl || avatarUrl || undefined}
          alt={`${label} wallet avatar`}
          className={cn("relative h-full w-full object-cover", imageClassName)}
        />
      ) : null}
    </span>
  );
}
