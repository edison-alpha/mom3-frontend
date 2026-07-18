"use client";

import { AppIcon } from "@/components/ui/app-icon";
import Link from "next/link";
import { motion } from "framer-motion";

import { WalletAvatar } from "@/components/ui/wallet-avatar";
import { profileSectionVariants } from "@/modules/profile/constants/profile.constants";
import type { ProfileStat } from "@/modules/profile/types/profile.types";

type ProfileHeroCardProps = {
  email: string | null;
  ownerAddress: string;
  stats: ProfileStat[];
  username?: string | null;
  isUsernameLoading?: boolean;
};

export function ProfileHeroCard({
  email,
  ownerAddress,
  stats,
  username,
  isUsernameLoading = false,
}: ProfileHeroCardProps) {
  return (
    <motion.section
      variants={profileSectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className="relative mt-5 overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_50%_0%,rgba(59,51,189,0.55),rgba(28,28,30,0.98)_56%,rgba(17,18,24,1)_100%)] p-4 text-center shadow-[0_18px_52px_-28px_rgba(59,51,189,0.9)]"
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#ccff00]/10 blur-[54px]" />
      <div className="pointer-events-none absolute -left-12 bottom-4 h-40 w-40 rounded-full bg-[#3B33BD]/35 blur-[54px]" />

      <div className="relative z-10">
        <div className="relative mx-auto block w-fit">
        <WalletAvatar
          address={ownerAddress}
          label="Profile"
          fallback={email || "Wallet"}
          size="lg"
          className="mx-auto shadow-[0_14px_34px_-14px_rgba(59,51,189,0.9)] ring-4 ring-black/25"
        />
        </div>
        <div className="mt-3 flex min-h-7 items-center justify-center gap-1.5" aria-label="Username">
          {isUsernameLoading ? <span className="h-5 w-24 animate-pulse rounded bg-white/10" aria-label="Loading username" /> : null}
          {username ? <>
            <h2 className="block max-w-full truncate text-xl font-black tracking-tight text-white">{username}</h2>
            <AppIcon
              icon="material-symbols:verified-rounded"
              aria-hidden="true"
              width={20}
              height={20}
              className="text-[#ccff00]"
            />
          </> : null}
        </div>
        {!username && !isUsernameLoading ? (
          <Link
            href="/claim-username"
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[#ccff00] px-4 text-xs font-black text-black transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171819]"
          >
            Claim username
          </Link>
        ) : null}
        <p className="mt-1 text-xs font-medium text-[#B8B8C5]">
          {email || "Universal wallet profile on mom3"}
        </p>

        {stats.length > 0 ? <div className="mt-4 grid grid-cols-3 gap-1.5">
          {stats.map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-black/25 p-2"
            >
              <p className="text-[10px] font-bold uppercase text-[#8E8E98]">
                {item.label}
              </p>
              <p className="mt-0.5 text-base font-black text-white">
                {item.value}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-[#ccff00]">
                {item.sub}
              </p>
            </motion.div>
          ))}
        </div> : null}
      </div>
    </motion.section>
  );
}
