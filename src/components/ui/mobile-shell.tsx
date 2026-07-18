import * as React from "react";

import { AppIcon } from "@/components/ui/app-icon";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";

type MobileShellProps = React.ComponentProps<"main"> & {
  contentClassName?: string;
  bottomSlot?: React.ReactNode;
};

export function MobileShell({
  children,
  className,
  contentClassName,
  bottomSlot,
  ...props
}: MobileShellProps) {
  return (
    <main
      className={cn(
        "min-h-screen min-h-dvh w-full min-w-0 overflow-x-hidden bg-black font-sans text-white antialiased",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto flex min-h-screen min-h-dvh w-full min-w-0 max-w-full flex-col px-5 pt-4 pb-28 sm:max-w-md",
          contentClassName,
        )}
      >
        {children}
      </div>
      {bottomSlot}
    </main>
  );
}

type MobileHeaderProps = React.ComponentProps<"header"> & {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
};

export function MobileHeader({
  title,
  backHref,
  backLabel = "Go back",
  action,
  className,
  ...props
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 mx-auto flex h-14 w-full max-w-md items-center justify-center bg-black/80 px-5 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      {backHref ? (
        <Link
          href={backHref}
          className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          aria-label={backLabel}
        >
          <AppIcon
            icon="lucide:chevron-left"
            aria-hidden="true"
            width={28}
            height={28}
          />
        </Link>
      ) : null}

      <Typography variant="h2" as="h1">{title}</Typography>

      {action ? <div className="absolute right-5">{action}</div> : null}
    </header>
  );
}

type MobilePageHeaderProps = React.ComponentProps<"header"> & {
  title: string;
  backHref?: string;
  backLabel?: string;
  leading?: React.ReactNode;
  action?: React.ReactNode;
};

export function MobilePageHeader({
  title,
  backHref,
  backLabel = "Go back",
  leading,
  action,
  className,
  ...props
}: MobilePageHeaderProps) {
  return (
    <header
      className={cn("relative flex h-12 items-center justify-center", className)}
      {...props}
    >
      {leading ? <div className="absolute left-0">{leading}</div> : null}

      {!leading && backHref ? (
        <Link
          href={backHref}
          aria-label={backLabel}
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
        >
          <AppIcon
            icon="lucide:chevron-left"
            aria-hidden="true"
            width={24}
            height={24}
          />
        </Link>
      ) : null}

      <Typography variant="h2" as="h1">{title}</Typography>

      {action ? <div className="absolute right-0">{action}</div> : null}
    </header>
  );
}

type MobileBottomBarProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

export function MobileBottomBar({ children, className, ...props }: MobileBottomBarProps) {
  return (
    <div
      className={cn("fixed inset-x-0 bottom-7 z-40 flex justify-center px-5", className)}
      {...props}
    >
      {children}
    </div>
  );
}
