"use client";

import { useQuery } from "@tanstack/react-query";
import { UA_TRANSACTION_STATUS } from "@particle-network/universal-account-sdk";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { universalAccountQueryKeys } from "@/providers/universal-account/constants/universal-account.constants";

export type UniversalTransactionState =
  | "submitted"
  | "confirming"
  | "completed"
  | "failed";

type ParticleTransactionStatus = {
  status?: number | string;
  transactionStatus?: number | string;
  [key: string]: unknown;
};

function getNumericStatus(transaction?: ParticleTransactionStatus | null) {
  const status = Number(transaction?.status ?? transaction?.transactionStatus);
  return Number.isFinite(status) ? status : null;
}

export function getUniversalTransactionState(
  transaction?: ParticleTransactionStatus | null,
): UniversalTransactionState {
  const status = getNumericStatus(transaction);

  if (
    status === UA_TRANSACTION_STATUS.EXECUTION_FAILED ||
    status === UA_TRANSACTION_STATUS.REFUND_FAILED
  ) {
    return "failed";
  }

  if (
    status === UA_TRANSACTION_STATUS.FINISHED ||
    status === UA_TRANSACTION_STATUS.REFUND_FINISHED
  ) {
    return "completed";
  }

  if (status === null || status === UA_TRANSACTION_STATUS.INITIALIZING) {
    return "submitted";
  }

  return "confirming";
}

export function useUniversalTransactionStatus(transactionId?: string | null) {
  const { universalAccount } = useUniversalAccount();

  const query = useQuery({
    queryKey: universalAccountQueryKeys.transaction(transactionId ?? undefined),
    queryFn: async () => {
      if (!universalAccount || !transactionId) return null;
      return (await universalAccount.getTransaction(transactionId)) as ParticleTransactionStatus;
    },
    enabled: Boolean(universalAccount && transactionId),
    staleTime: 2_000,
    refetchInterval: (currentQuery) => {
      const state = getUniversalTransactionState(
        currentQuery.state.data as ParticleTransactionStatus | null | undefined,
      );
      return state === "completed" || state === "failed" ? false : 3_000;
    },
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  return {
    transaction: query.data ?? null,
    state: getUniversalTransactionState(query.data),
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  };
}
