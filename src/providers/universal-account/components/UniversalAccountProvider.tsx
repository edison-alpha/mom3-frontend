"use client";

import { createContext, useContext, useMemo } from "react";

import { useMagic } from "@/providers/magic/components/MagicProvider";
import type {
  UniversalAccountContextType,
  UniversalAccountProviderProps,
} from "@/providers/universal-account/types/universal-account.types";
import {
  useEnsureDelegatedMutation,
  useUniversalAccountInstanceQuery,
  useUniversalAccountSnapshotQuery,
  useRefreshAccount,
  useSignAndSend,
} from "@/providers/universal-account/hooks/useUniversalAccountQueries";

const emptyAccountInfo = {
  ownerAddress: "",
  evmSmartAccount: "",
  solanaSmartAccount: "",
} as const;

const UniversalAccountContext = createContext<UniversalAccountContextType | null>(null);

export function UniversalAccountProvider({ children }: UniversalAccountProviderProps) {
  const { magic, session } = useMagic();
  const ownerAddress = session?.ownerAddress;

  const universalAccountQuery = useUniversalAccountInstanceQuery(ownerAddress);
  const snapshotQuery = useUniversalAccountSnapshotQuery(
    universalAccountQuery.data,
    ownerAddress,
  );

  const ensureDelegatedMutation = useEnsureDelegatedMutation(
    universalAccountQuery.data,
    magic,
    ownerAddress,
  );

  const refreshAccount = useRefreshAccount(ownerAddress);
  const signAndSend = useSignAndSend(
    universalAccountQuery.data,
    magic,
    ownerAddress,
  );

  const value = useMemo(
    () => ({
      universalAccount: universalAccountQuery.data ?? null,
      accountInfo: snapshotQuery.data?.accountInfo ?? {
        ...emptyAccountInfo,
        ownerAddress: ownerAddress || "",
      },
      eip7702Deployments: snapshotQuery.data?.eip7702Deployments ?? [],
      primaryAssets: snapshotQuery.data?.primaryAssets ?? null,
      isDelegated: snapshotQuery.data?.isDelegated ?? false,
      isLoading:
        universalAccountQuery.isLoading ||
        snapshotQuery.isLoading ||
        snapshotQuery.isFetching ||
        ensureDelegatedMutation.isPending,
      error:
        universalAccountQuery.error?.message ||
        snapshotQuery.error?.message ||
        ensureDelegatedMutation.error?.message ||
        null,
      refreshAccount,
      ensureDelegated: (chainId = 42161) => ensureDelegatedMutation.mutateAsync(chainId),
      signAndSend,
    }),
    [
      universalAccountQuery.data,
      universalAccountQuery.error?.message,
      universalAccountQuery.isLoading,
      snapshotQuery.data,
      snapshotQuery.error?.message,
      snapshotQuery.isFetching,
      snapshotQuery.isLoading,
      ensureDelegatedMutation.error?.message,
      ensureDelegatedMutation.isPending,
      ensureDelegatedMutation.mutateAsync,
      ownerAddress,
      refreshAccount,
      signAndSend,
    ],
  );

  return (
    <UniversalAccountContext.Provider value={value}>
      {children}
    </UniversalAccountContext.Provider>
  );
}

export function useUniversalAccount() {
  const context = useContext(UniversalAccountContext);

  if (!context) {
    throw new Error("useUniversalAccount must be used within UniversalAccountProvider");
  }

  return context;
}
