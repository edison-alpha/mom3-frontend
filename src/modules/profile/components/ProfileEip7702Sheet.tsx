"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { chainBadgeIconFromId, chainNameFromId } from "@/lib/chain";
import type { Eip7702Deployment } from "@/types/universal-account.types";

type ProfileEip7702SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deployments: Eip7702Deployment[];
  isLoading: boolean;
  activeChainId: number | null;
  error: string | null;
  onDelegate: (chainId: number) => void;
};

function DelegationSwitch({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "EIP-7702 delegated" : "Delegate EIP-7702 on this chain"}
      disabled={disabled || checked}
      onClick={onClick}
      className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111217] motion-reduce:transition-none ${
        checked ? "bg-[#ccff00]" : "bg-white/10 hover:bg-white/15"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span
        className={`block h-6 w-6 rounded-full shadow-sm transition-transform duration-150 motion-reduce:transition-none ${
          checked ? "translate-x-6 bg-[#16162a]" : "translate-x-0 bg-[#8F89FF]"
        }`}
      />
    </button>
  );
}

export function ProfileEip7702Sheet({
  open,
  onOpenChange,
  deployments,
  isLoading,
  activeChainId,
  error,
  onDelegate,
}: ProfileEip7702SheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="EIP-7702"
      description="Delegate your Universal Account on each compatible chain."
      closeLabel="Close EIP-7702 delegation"
      className="max-h-[90vh]"
      contentClassName="space-y-3"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-[#1C1C1E] px-3.5 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ccff00]/15 text-[#ccff00]">
          <AppIcon icon="solar:shield-check-bold" aria-hidden="true" width={21} height={21} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black text-white">Chain delegation</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-[#9A9AA2]">
            Delegation is stored per chain. Your account can be ready on one chain while another still needs approval.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" role="status">
          <span className="sr-only">Loading EIP-7702 chain status.</span>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex min-h-[72px] items-center gap-3 rounded-2xl bg-black/25 px-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1">
                <SkeletonText className="h-4 w-28" />
                <SkeletonText className="mt-2 h-3 w-36" />
              </div>
              <Skeleton className="h-8 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : deployments.length > 0 ? (
        <div className="space-y-2" aria-label="EIP-7702 compatible chains">
          {deployments.map((deployment) => {
            const isPending = activeChainId === deployment.chainId;
            const chainName = chainNameFromId(deployment.chainId);
            return (
              <div key={deployment.chainId} className="flex min-h-[72px] items-center gap-3 rounded-2xl bg-black/25 px-3 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A2A3E]">
                  <AppIcon icon={chainBadgeIconFromId(deployment.chainId)} aria-hidden="true" width={23} height={23} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-white">{chainName}</span>
                  <span className={`mt-0.5 block text-xs font-semibold ${deployment.isDelegated ? "text-[#ccff00]" : "text-[#9A9AA2]"}`}>
                    {isPending ? "Waiting for approval…" : deployment.isDelegated ? "Delegated" : "Not delegated"}
                  </span>
                </span>
                <DelegationSwitch
                  checked={deployment.isDelegated}
                  disabled={isPending || activeChainId !== null}
                  onClick={() => onDelegate(deployment.chainId)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-black/25 px-4 py-6 text-center">
          <AppIcon icon="solar:global-bold" aria-hidden="true" width={28} height={28} className="mx-auto text-[#8F89FF]" />
          <p className="mt-2 text-sm font-black text-white">No chain status available</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-[#9A9AA2]">Refresh your Universal Account and try again.</p>
        </div>
      )}

      {error ? (
        <div className="rounded-2xl bg-red-500/10 px-3 py-2.5" role="alert">
          <p className="text-sm font-semibold leading-relaxed text-red-100">{error}</p>
        </div>
      ) : null}
    </BottomSheet>
  );
}
