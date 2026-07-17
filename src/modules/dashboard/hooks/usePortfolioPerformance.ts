"use client";

import { useQuery } from "@tanstack/react-query";
import { getHistoryPerformance, syncHistory } from "@/modules/history/api/history.api";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";

export function usePortfolioPerformance(totalValue: number) {
  const { universalAccount, accountInfo } = useUniversalAccount();
  const account = accountInfo.evmSmartAccount || accountInfo.ownerAddress || "";

  return useQuery({
    queryKey: ["portfolio-performance", account, totalValue],
    enabled: Boolean(universalAccount && account),
    staleTime: 30_000,
    queryFn: async () => {
      const response = await universalAccount!.getTransactions(1, 50);
      const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      if (transactions.length) await syncHistory(account, transactions);
      return getHistoryPerformance(account, totalValue);
    },
  });
}
