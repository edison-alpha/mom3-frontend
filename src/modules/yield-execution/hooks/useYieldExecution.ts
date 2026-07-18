"use client";

import { SUPPORTED_TOKEN_TYPE } from "@particle-network/universal-account-sdk";
import * as React from "react";

import type { AiExecutionIntent } from "@/modules/ai/types/ai.types";
import { isTransactionQuoteExpired } from "@/modules/send/utils/send.utils";
import type { YieldAction } from "@/modules/yield-execution/types/yield-execution.types";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { prepareSponsoredTransaction } from "@/providers/universal-account/utils/gas-sponsorship.utils";
import { syncHistory } from "@/modules/history/api/history.api";

function particleTokenType(symbol: string): SUPPORTED_TOKEN_TYPE | null {
  switch (symbol.trim().toUpperCase()) {
    case "ETH": return SUPPORTED_TOKEN_TYPE.ETH;
    case "USDT": return SUPPORTED_TOKEN_TYPE.USDT;
    case "USDC": return SUPPORTED_TOKEN_TYPE.USDC;
    case "BNB": return SUPPORTED_TOKEN_TYPE.BNB;
    case "SOL": return SUPPORTED_TOKEN_TYPE.SOL;
    default: return null;
  }
}

type ExecutionStatus = "idle" | "preparing" | "signing" | "success" | "error";

export function useYieldExecution(action: YieldAction) {
  const { accountInfo, universalAccount, signAndSend, refreshAccount } = useUniversalAccount();
  const [status, setStatus] = React.useState<ExecutionStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [transaction, setTransaction] = React.useState<any>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  const [intent, setIntent] = React.useState<AiExecutionIntent | null>(null);

  const prepare = React.useCallback(async (marketId: string, amount: string, chainId: number) => {
    const userAddress = chainId === 101 ? accountInfo.solanaSmartAccount : accountInfo.evmSmartAccount;
    if (!universalAccount || !userAddress) {
      setError("Your Universal Account is not ready yet.");
      setStatus("error");
      return null;
    }
    setStatus("preparing");
    setError(null);
    setTransaction(null);
    setTransactionId(null);
    setIntent(null);

    try {
      const response = await fetch("/api/ai/execution-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market_id: marketId,
          action,
          amount,
          user_address: userAddress,
        }),
      });
      const nextIntent = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(nextIntent.detail || nextIntent.error || `Unable to prepare ${action}.`);

      const validated = nextIntent as AiExecutionIntent;
      if (
        validated.validated_by !== "mom3-backend" ||
        validated.action !== action ||
        validated.chain_id !== chainId ||
        validated.receiver !== userAddress && validated.receiver?.toLowerCase?.() !== userAddress.toLowerCase() ||
        !Array.isArray(validated.transactions) ||
        validated.transactions.length === 0
      ) {
        throw new Error("The validated transaction does not match this market.");
      }

      const expectedTokenType = particleTokenType(validated.asset?.symbol || "");
      if (!expectedTokenType) {
        throw new Error(
          `${validated.asset?.symbol || "This asset"} is not a Particle Universal Account primary token. This market needs a verified swap adapter before it can be executed cross-chain.`,
        );
      }

      const particleTransaction = await universalAccount.createUniversalTransaction({
        chainId,
          expectTokens: action === "supply"
          ? [{ type: expectedTokenType, amount: validated.amount }]
          : [],
        transactions: validated.transactions,
      });
      const nextTransaction = prepareSponsoredTransaction(particleTransaction);
      setIntent(validated);
      setTransaction(nextTransaction);
      setStatus("idle");
      return nextTransaction;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : `We couldn't prepare this ${action}.`;
      setError(/delegat|eip.?7702|universal account/i.test(message)
        ? "Your Universal Account is not delegated on this chain. Complete delegation, then review the supply again."
        : message);
      setStatus("error");
      return null;
    }
  }, [accountInfo.evmSmartAccount, accountInfo.solanaSmartAccount, action, universalAccount]);

  const execute = React.useCallback(async () => {
    if (!transaction) return null;
    if (isTransactionQuoteExpired(transaction)) {
      setError("This Particle quote has expired. Review the transaction again to refresh route and fees.");
      setTransaction(null);
      setStatus("error");
      return null;
    }
    setStatus("signing");
    setError(null);
    try {
      const result = await signAndSend(transaction);
      const id = result.transactionId ?? transaction.transactionId ?? null;
      setTransactionId(id);
      setStatus("success");
      const account = accountInfo.evmSmartAccount || accountInfo.solanaSmartAccount;
      if (account && universalAccount) {
        void universalAccount.getTransactions(1, 50).then((response: any) => {
          const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
          return syncHistory(account, transactions);
        }).catch(() => undefined);
      }
      await refreshAccount();
      return id;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `We couldn't submit this ${action}.`);
      setStatus("error");
      return null;
    }
  }, [accountInfo.evmSmartAccount, accountInfo.solanaSmartAccount, action, refreshAccount, signAndSend, transaction, universalAccount]);

  const reset = React.useCallback(() => {
    setStatus("idle");
    setError(null);
    setTransaction(null);
    setTransactionId(null);
    setIntent(null);
  }, []);

  return {
    prepare,
    execute,
    reset,
    status,
    error,
    transaction,
    transactionId,
    intent,
    isPreparing: status === "preparing",
    isSigning: status === "signing",
  };
}
