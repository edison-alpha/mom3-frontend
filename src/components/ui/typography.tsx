import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("font-rounded", {
  variants: {
    variant: {
      display: "text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl",
      h1: "text-2xl font-black leading-tight tracking-[-0.025em] sm:text-3xl",
      h2: "text-xl font-black leading-tight tracking-[-0.02em] sm:text-2xl",
      h3: "text-base font-black leading-snug sm:text-lg",
      h4: "text-sm font-bold leading-snug sm:text-base",
      body: "text-base font-medium leading-relaxed",
      "body-sm": "text-sm font-medium leading-relaxed",
      label: "text-xs font-black uppercase leading-tight tracking-[0.08em]",
      caption: "text-xs font-medium leading-relaxed",
      overline: "text-[11px] font-black uppercase leading-tight tracking-[0.12em]",
      numeric: "font-mono text-3xl font-black leading-none tracking-tight tabular-nums",
    },
    color: {
      default: "text-white",
      muted: "text-[#9A9AA2]",
      subtle: "text-[#A7A7B7]",
      accent: "text-[#ccff00]",
      primary: "text-[#8F89FF]",
      danger: "text-red-200",
      success: "text-emerald-300",
      inherit: "text-inherit",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
    align: "left",
  },
});

type TypographyProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    as?: React.ElementType;
    htmlFor?: string;
    truncate?: boolean;
    balance?: boolean;
  };

function Typography({
  as,
  variant,
  color,
  align,
  className,
  truncate = false,
  balance = false,
  children,
  ...props
}: TypographyProps) {
  const Component = as ?? (variant === "h1" || variant === "display" ? "h1" : variant?.startsWith("h") ? variant : "p");

  return React.createElement(
    Component,
    {
      ...props,
      className: cn(
        typographyVariants({ variant, color, align, className }),
        truncate && "truncate",
        balance && "text-balance",
      ),
    },
    children,
  );
}

export { Typography, Typography as Text, typographyVariants };
export type { TypographyProps };
