"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { motion } from "framer-motion";

import { chainBadgeIconFromId, chainNameFromId } from "@/lib/chain";
import { profileSectionVariants } from "@/modules/profile/constants/profile.constants";
import type { ProfileIdentityRow } from "@/modules/profile/types/profile.types";
import { UniversalAccountOwnerRow } from "@/modules/profile/components/UniversalAccountSheet";

type ProfileIdentityListProps = {
  rows: ProfileIdentityRow[];
  onOpenUniversalAccount: () => void;
  onOpenEip7702: () => void;
  delegatedChainIds: number[];
};

export function ProfileIdentityList({
  rows,
  onOpenUniversalAccount,
  onOpenEip7702,
  delegatedChainIds,
}: ProfileIdentityListProps) {
  return (
    <motion.section
      variants={profileSectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="mt-4 overflow-hidden rounded-[28px] bg-[#1C1C1E]"
    >
      {rows.map((row, index) => {
        const isOwnerEoa = row.label === "Owner EOA";
        const bordered = index < rows.length - 1;

        return (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.15 + index * 0.06 }}
          >
            {isOwnerEoa ? (
              <UniversalAccountOwnerRow
                icon={row.icon}
                label={row.label}
                value={row.value}
                bordered={bordered}
                onOpen={onOpenUniversalAccount}
              />
            ) : row.label === "Wallet status" ? (
              <button
                type="button"
                onClick={onOpenEip7702}
              aria-label="Open wallet network status"
                className={`flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B33BD] ${
                  bordered ? "border-b border-white/5" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A2A3E] text-white">
                  <AppIcon icon={row.icon} aria-hidden="true" width={20} height={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-white">{row.label}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs font-medium text-[#9A9AA2]">
                    <span>{row.value}</span>
                    {delegatedChainIds.length > 0 ? (
                      <span className="flex items-center gap-1" aria-label="Delegated chains">
                        {delegatedChainIds.map((chainId) => (
                          <span
                            key={chainId}
                            title={chainNameFromId(chainId)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06]"
                          >
                            <AppIcon icon={chainBadgeIconFromId(chainId)} aria-hidden="true" width={13} height={13} />
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </span>
                <AppIcon icon="solar:alt-arrow-right-bold" aria-hidden="true" width={18} height={18} className="shrink-0 text-[#66666D]" />
              </button>
            ) : (
              <div
                className={`flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left ${
                  bordered ? "border-b border-white/5" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3E] text-white">
                  <AppIcon icon={row.icon} aria-hidden="true" width={20} height={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-white">
                    {row.label}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-[#9A9AA2]">
                    {row.value}
                  </span>
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.section>
  );
}
