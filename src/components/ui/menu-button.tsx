"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

const MenuButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="menu-button"
    className={cn(
      "flex items-center gap-0.5 rounded-full border border-white/25 bg-white/10 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
      className
    )}
    {...props}
  />
));
MenuButton.displayName = "MenuButton";

interface MenuButtonItemProps extends React.ComponentProps<"button"> {
  active?: boolean;
  /** Visual variant for the left (primary) slot. */
  variant?: "default" | "glass";
}

const MenuButtonItem = React.forwardRef<
  HTMLButtonElement,
  MenuButtonItemProps
>(({ className, active, variant = "default", children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    data-slot="menu-button-item"
    data-active={active ? "true" : undefined}
    className={cn(
      "relative flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold transition-all md:px-5 md:py-2.5 md:text-base",
      // Active state
      active &&
        "bg-[#0A0A0A] text-white shadow-[inset_0_-3px_6px_0_rgba(255,255,255,0.18),inset_0_3px_6px_0_rgba(0,0,0,0.4),0_2px_6px_0_rgba(0,0,0,0.25)]",
      // Glass variant when not active
      !active &&
        variant === "glass" &&
        "bg-white/15 text-[#0A0A0A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] backdrop-blur-md ring-1 ring-white/30 hover:bg-white/25",
      // Default non-active
      !active && variant === "default" && "text-[#0A0A0A] hover:bg-white/20",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
MenuButtonItem.displayName = "MenuButtonItem";

type FloatingMenuItem = {
  icon: string;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

interface FloatingMenuButtonProps extends React.HTMLAttributes<HTMLElement> {
  items?: FloatingMenuItem[];
  activeHref?: string;
  profileHref?: string;
  profileLabel?: string;
  onProfileClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const defaultFloatingMenuItems: FloatingMenuItem[] = [
  {
    icon: "solar:home-2-bold",
    label: "Home",
    href: "/dashboard",
  },
  {
    icon: "material-symbols:history-2",
    label: "History",
    href: "#history",
  },
  {
    icon: "icon-park-outline:search",
    label: "Search",
    href: "#search",
  },
];

const FloatingMenuButton = React.forwardRef<HTMLElement, FloatingMenuButtonProps>(
  (
    {
      className,
      items = defaultFloatingMenuItems,
      activeHref,
      profileHref,
      profileLabel = "Profile",
      onProfileClick,
      ...props
    },
    ref
  ) => {
    const profileClassName =
      "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B33BD] via-[#5A52D4] to-[#7E78EA] shadow-[0_8px_24px_-8px_rgba(59,51,189,0.65)] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

    return (
      <nav
        ref={ref}
        aria-label="Primary"
        data-slot="floating-menu-button"
        className={cn(
          "fixed inset-x-0 bottom-5 z-50 flex justify-center px-5 sm:bottom-6",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#1C1C1E]/90 p-1.5 shadow-[0_16px_44px_-18px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="flex h-14 items-center gap-1 rounded-full bg-black/25 px-1">
            {items.map((item) => {
              const isActive = item.active ?? item.href === activeHref;
              const itemClassName = cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-[#9A9AA2] transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                isActive && "bg-white text-[#3B33BD] hover:bg-white hover:text-[#3B33BD]"
              );
              const icon = (
                <Icon
                  icon={item.icon}
                  aria-hidden="true"
                  width={22}
                  height={22}
                />
              );

              if (item.href) {
                return (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={itemClassName}
                  >
                    {icon}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={item.onClick}
                  className={itemClassName}
                >
                  {icon}
                </button>
              );
            })}
          </div>

          {profileHref ? (
            <Link
              href={profileHref}
              aria-label={profileLabel}
              className={profileClassName}
            />
          ) : (
            <button
              type="button"
              aria-label={profileLabel}
              onClick={onProfileClick}
              className={profileClassName}
            />
          )}
        </div>
      </nav>
    );
  }
);
FloatingMenuButton.displayName = "FloatingMenuButton";

export { MenuButton, MenuButtonItem, FloatingMenuButton };
