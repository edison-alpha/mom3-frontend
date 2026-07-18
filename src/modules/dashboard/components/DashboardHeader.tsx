import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

import { WalletAvatar } from "@/components/ui/wallet-avatar";
import { cn } from "@/lib/utils";
import { currencyOptions } from "../constants/dashboard";
import type { CurrencyCode } from "../types/dashboard.types";

type DashboardHeaderProps = {
  currency: CurrencyCode;
  currencyOpen: boolean;
  profileAddress?: string;
  profileFallback?: string;
  username?: string | null;
  onSelectCurrency: (code: CurrencyCode) => void;
  onToggleCurrencyMenu: () => void;
};

export function DashboardHeader({
  currency,
  currencyOpen,
  profileAddress,
  profileFallback,
  username,
  onSelectCurrency,
  onToggleCurrencyMenu,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <WalletAvatar
          address={profileAddress}
          label="Profile"
          fallback={profileFallback || "Wallet"}
          size="sm"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black">{username || "Username not claimed"}</span>
            {username ? <AppIcon
              icon="material-symbols:verified-rounded"
              aria-hidden="true"
              width={20}
              height={20}
              className="text-[#ccff00]"
            /> : null}
          </div>
        </div>
      </div>

      <div className="relative">
        <Button
          type="button"
          onClick={onToggleCurrencyMenu}
          color="dark"
          size="compact"
          rounded="full"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1C1C1E] px-3 text-xs font-bold text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          aria-label="Select wallet currency"
          aria-expanded={currencyOpen}
          aria-haspopup="menu"
        >
          <AppIcon
            icon="ic:twotone-wallet"
            aria-hidden="true"
            width={20}
            height={20}
          />
          {currency}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-[#9A9AA2] transition-transform",
              currencyOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </Button>

        {currencyOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-30 w-32 overflow-hidden rounded-2xl border border-white/10 bg-[#16161A]/95 p-1.5 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.75)] backdrop-blur-xl"
          >
            {(Object.keys(currencyOptions) as CurrencyCode[]).map((code) => (
              <Button
                key={code}
                type="button"
                role="menuitem"
                onClick={() => onSelectCurrency(code)}
                variant="plain"
                size="compact"
                rounded="md"
                label={code}
                className={cn(
                  "flex h-9 w-full items-center justify-between rounded-xl px-3 text-xs font-bold transition-colors",
                  currency === code
                    ? "bg-[#3B33BD] text-[#ccff00]"
                    : "text-white/75 hover:bg-white/[0.08] hover:text-white",
                )}
              >
                {code}
                {currency === code ? (
                  <AppIcon
                    icon="material-symbols:check-rounded"
                    width={17}
                    height={17}
                    aria-hidden="true"
                  />
                ) : null}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
