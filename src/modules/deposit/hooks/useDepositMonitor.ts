"use client";

import * as React from "react";
import type { IAssetsResponse } from "@particle-network/universal-account-sdk";

import type {
  DepositAsset,
  DepositMonitorStatus,
} from "@/modules/deposit/types/deposit.types";
import { getDepositAssetBalance } from "@/modules/deposit/utils/deposit.utils";

const BALANCE_EPSILON = 1e-9;

export function useDepositMonitor({
  primaryAssets,
  selectedAsset,
  refreshAccount,
}: {
  primaryAssets: IAssetsResponse | null;
  selectedAsset: DepositAsset;
  refreshAccount: () => Promise<void>;
}) {
  const currentBalance = React.useMemo(
    () => getDepositAssetBalance(primaryAssets, selectedAsset),
    [primaryAssets, selectedAsset],
  );
  const baselineRef = React.useRef<number | null>(null);
  const selectedAssetIdRef = React.useRef(selectedAsset.id);
  const [status, setStatus] = React.useState<DepositMonitorStatus>("initializing");
  const [receivedAmount, setReceivedAmount] = React.useState(0);
  const [lastCheckedAt, setLastCheckedAt] = React.useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (selectedAssetIdRef.current !== selectedAsset.id) {
      selectedAssetIdRef.current = selectedAsset.id;
      baselineRef.current = null;
      setReceivedAmount(0);
      setStatus("initializing");
      setLastCheckedAt(null);
    }

    if (!primaryAssets) return;

    if (baselineRef.current === null) {
      baselineRef.current = currentBalance;
      setStatus("watching");
      setLastCheckedAt(new Date());
      return;
    }

    const delta = currentBalance - baselineRef.current;
    setLastCheckedAt(new Date());

    if (delta > BALANCE_EPSILON) {
      setReceivedAmount(delta);
      setStatus("received");
    }
  }, [currentBalance, primaryAssets, selectedAsset.id]);

  const refresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAccount();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAccount]);

  const monitorNextDeposit = React.useCallback(() => {
    baselineRef.current = currentBalance;
    setReceivedAmount(0);
    setStatus("watching");
    setLastCheckedAt(new Date());
  }, [currentBalance]);

  return {
    currentBalance,
    status,
    receivedAmount,
    lastCheckedAt,
    isRefreshing,
    refresh,
    monitorNextDeposit,
  };
}

