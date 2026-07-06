"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import { useMagic } from "@/providers/MagicProvider";
import { useUniversalAccount } from "@/providers/UniversalAccountProvider";
import { truncateAddress } from "@/lib/wallet-session";

const stats = [
  { label: "Score", value: "92", sub: "Trusted" },
  { label: "Streak", value: "14d", sub: "Active" },
  { label: "Rewards", value: "0.00", sub: "MOM" },
];

const actionRows = [
  {
    icon: "solar:user-id-bold",
    label: "Public profile",
    value: "mom3/u/ubayy",
  },
  {
    icon: "solar:chart-2-bold",
    label: "AI rebalancing",
    value: "Ready",
  },
  {
    icon: "solar:bell-bold",
    label: "Activity alerts",
    value: "Enabled",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfileView() {
  const router = useRouter();
  const { isLoading: isMagicLoading, logout: magicLogout, session } = useMagic();
  const {
    accountInfo,
    ensureDelegated,
    error: universalAccountError,
    isDelegated,
    isLoading: isUniversalAccountLoading,
    primaryAssets,
    refreshAccount,
    universalAccount,
  } = useUniversalAccount();
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);

  useQuery({
    queryKey: ["profile", "missing-session", session?.ownerAddress || "anonymous"],
    queryFn: async () => {
      router.replace("/login");
      return true;
    },
    enabled: !isMagicLoading && !session?.ownerAddress,
    staleTime: Infinity,
  });

  const delegateMutation = useMutation({
    mutationFn: async () => {
      await ensureDelegated();
      await refreshAccount();
    },
  });

  const totalUsd =
    primaryAssets && "totalAmountInUSD" in primaryAssets
      ? Number(primaryAssets.totalAmountInUSD || 0)
      : 0;

  const identityRows = [
    {
      icon: "solar:wallet-money-bold",
      label: "Universal Balance",
      value: isUniversalAccountLoading ? "Loading" : `$${totalUsd.toFixed(2)}`,
    },
    {
      icon: "solar:shield-check-bold",
      label: "EIP-7702",
      value: isDelegated ? "Delegated" : "Ready to upgrade",
    },
    {
      icon: "solar:global-bold",
      label: "Owner EOA",
      value: truncateAddress(session?.ownerAddress || ""),
    },
  ];

  const logout = async () => {
    await magicLogout();
    router.replace("/landing-detail");
  };

  const copyAddress = async (address: string, label: string) => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopiedAddress(label);
    window.setTimeout(() => setCopiedAddress(null), 1200);
  };

  const ownerAddress = accountInfo.ownerAddress || session?.ownerAddress || "";
  const universalAccountRows = [
    {
      icon: "solar:user-id-bold",
      label: "Owner EOA",
      description: "Magic signer",
      address: ownerAddress,
    },
    {
      icon: "solar:global-bold",
      label: "EVM account",
      description: "Universal EVM smart account",
      address: accountInfo.evmSmartAccount,
    },
    {
      icon: "token-branded:solana",
      label: "Solana account",
      description: "Universal Solana address",
      address: accountInfo.solanaSmartAccount,
    },
  ];

  return (
    <MobileShell>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <MobilePageHeader title="Profile" backHref="/dashboard" backLabel="Back to dashboard" />
        </motion.div>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
          className="relative mt-5 overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_50%_0%,rgba(59,51,189,0.55),rgba(28,28,30,0.98)_56%,rgba(17,18,24,1)_100%)] p-4 text-center shadow-[0_18px_52px_-28px_rgba(59,51,189,0.9)]"
        >
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#ccff00]/10 blur-[54px]" />
          <div className="pointer-events-none absolute -left-12 bottom-4 h-40 w-40 rounded-full bg-[#3B33BD]/35 blur-[54px]" />

          <div className="relative z-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3B33BD] via-[#5A52D4] to-[#7E78EA] shadow-[0_14px_34px_-14px_rgba(59,51,189,0.9)] ring-4 ring-black/25">
              <span className="text-2xl font-black text-white">U</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <h2 className="text-xl font-black tracking-tight text-white">
                @ubayy
              </h2>
              <Icon
                icon="material-symbols:verified-rounded"
                aria-hidden="true"
                width={20}
                height={20}
                className="text-[#ccff00]"
              />
            </div>
            <p className="mt-1 text-xs font-medium text-[#B8B8C5]">
              {session?.email || "Universal wallet profile on mom3"}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-1.5">
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
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="mt-4 rounded-[28px] bg-[#1C1C1E] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Universal Account</h3>
              <p className="mt-1 text-sm font-medium text-[#9A9AA2]">
                One wallet identity across EVM and Solana.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshAccount}
              disabled={isUniversalAccountLoading}
              aria-label="Refresh Universal Account"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:opacity-60"
            >
              <Icon
                icon="lucide:refresh-cw"
                aria-hidden="true"
                width={18}
                height={18}
                className={isUniversalAccountLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => copyAddress(ownerAddress, "Owner EOA")}
            disabled={!ownerAddress}
            className="mt-4 flex min-h-[76px] w-full items-center gap-3 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(59,51,189,0.35),rgba(0,0,0,0.22))] px-4 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ccff00] text-[#3B33BD]">
              <Icon icon="solar:wallet-money-bold" aria-hidden="true" width={22} height={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Primary wallet</span>
                <span className="rounded-full bg-[#ccff00]/10 px-2 py-0.5 text-[10px] font-black uppercase text-[#ccff00]">
                  {isDelegated ? "7702 active" : "EOA"}
                </span>
              </span>
              <span className="mt-1 block truncate font-mono text-base font-black tabular-nums text-white">
                {ownerAddress ? truncateAddress(ownerAddress, 5) : "Initializing"}
              </span>
            </span>
            <Icon icon="lucide:copy" aria-hidden="true" width={18} height={18} className="shrink-0 text-[#9A9AA2]" />
          </button>

          <div className="mt-3 space-y-2">
            {universalAccountRows.map((row) => (
              <button
                type="button"
                key={row.label}
                onClick={() => copyAddress(row.address, row.label)}
                disabled={!row.address}
                aria-label={`Copy ${row.label} address`}
                className="flex min-h-[58px] w-full items-center gap-3 rounded-2xl bg-black/25 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A2A3E] text-[#8F89FF]">
                  <Icon icon={row.icon} aria-hidden="true" width={20} height={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="shrink-0 text-sm font-bold text-white">{row.label}</span>
                    <span className="min-w-0 truncate text-right font-mono text-xs font-bold tabular-nums text-white">
                      {row.address ? truncateAddress(row.address) : "Not ready"}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-[#8E8E98]">
                    {row.description}
                  </span>
                </span>
                <Icon icon="lucide:copy" aria-hidden="true" width={16} height={16} className="shrink-0 text-[#66666D]" />
              </button>
            ))}
          </div>

          {universalAccountError || delegateMutation.error ? (
            <p role="alert" className="mt-3 rounded-2xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100">
              {delegateMutation.error?.message || universalAccountError}
            </p>
          ) : null}

          {copiedAddress ? (
            <p className="mt-3 text-xs font-bold text-[#ccff00]">
              {copiedAddress} copied
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              delegateMutation.mutate();
            }}
            disabled={!universalAccount || isDelegated || delegateMutation.isPending}
            aria-busy={delegateMutation.isPending}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ccff00] text-base font-black text-[#3B33BD] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon
              icon={delegateMutation.isPending ? "lucide:loader-circle" : "solar:shield-check-bold"}
              aria-hidden="true"
              width={20}
              height={20}
              className={delegateMutation.isPending ? "animate-spin" : ""}
            />
            {isDelegated ? "EOA upgraded" : "Upgrade EOA with 7702"}
          </button>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-4 overflow-hidden rounded-[28px] bg-[#1C1C1E]"
        >
          {identityRows.map((row, index) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 + index * 0.06 }}
              className={`flex min-h-[64px] items-center gap-3 px-4 py-3 ${
                index < identityRows.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3E] text-white">
                <Icon icon={row.icon} aria-hidden="true" width={20} height={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">
                  {row.label}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-[#9A9AA2]">
                  {row.value}
                </span>
              </span>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 overflow-hidden rounded-[28px] bg-[#1C1C1E]"
        >
          {actionRows.map((row, index) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.06 }}
            >
              <Link
                href={row.label === "AI rebalancing" ? "/ai" : "#"}
                className={`flex min-h-[64px] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#3B33BD] ${
                  index < actionRows.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B33BD]/20 text-[#8F89FF]">
                  <Icon icon={row.icon} aria-hidden="true" width={20} height={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-white">
                    {row.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-[#9A9AA2]">
                    {row.value}
                  </span>
                </span>
                <Icon
                  icon="lucide:chevron-right"
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className="text-[#66666D]"
                />
              </Link>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="mt-4 space-y-3"
        >
          <button
            type="button"
            onClick={logout}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-[#1C1C1E] text-base font-bold text-white transition-colors hover:bg-[#262628] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          >
            <Icon icon="lucide:log-out" aria-hidden="true" width={20} height={20} />
            Log out
          </button>
        </motion.section>
    </MobileShell>
  );
}
