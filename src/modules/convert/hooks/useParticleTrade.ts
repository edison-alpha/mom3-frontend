"use client";

import * as React from "react";
import {
  SUPPORTED_TOKEN_TYPE,
  type ITransaction,
} from "@particle-network/universal-account-sdk";

import { getSendErrorMessage } from "@/modules/send/utils/send.utils";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { prepareSponsoredTransaction } from "@/providers/universal-account/utils/gas-sponsorship.utils";

export type TradeStatus = "idle" | "preparing" | "signing" | "success" | "error";

export type ConvertRequest = {
  chainId: number;
  amount: string;
};

export function useParticleTrade() {
  const { universalAccount, signAndSend, refreshAccount } = useUniversalAccount();
  const [status, setStatus] = React.useState<TradeStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  const [transaction, setTransaction] = React.useState<ITransaction | null>(null);
  const submitInFlightRef = React.useRef(false);

  const prepare = React.useCallback(
    async (request: ConvertRequest) => {
      if (!universalAccount) {
        setError("Your Universal Account is not ready. Reconnect and try again.");
        setStatus("error");
        return null;
      }

      setError(null);
      setTransactionId(null);
      setTransaction(null);
      setStatus("preparing");

      try {
        const particleTransaction = await universalAccount.createConvertTransaction({
          expectToken: {
            type: SUPPORTED_TOKEN_TYPE.USDC,
            amount: request.amount,
          },
          chainId: request.chainId,
        });
        const nextTransaction = prepareSponsoredTransaction(particleTransaction);

        if (
          !nextTransaction.transactionId ||
          !nextTransaction.rootHash ||
          !Array.isArray(nextTransaction.userOps) ||
          nextTransaction.userOps.length === 0
        ) {
          throw new Error("Particle returned an incomplete convert quote.");
        }

        setTransaction(nextTransaction);
        setStatus("idle");
        return nextTransaction;
      } catch (cause) {
        setError(getSendErrorMessage(cause));
        setStatus("error");
        return null;
      }
    },
    [universalAccount],
  );

  const execute = React.useCallback(
    async (preparedTransaction = transaction) => {
      if (!preparedTransaction || submitInFlightRef.current) return null;

      submitInFlightRef.current = true;
      setError(null);
      setStatus("signing");

      try {
        // Particle injects signatures into the submitted object. Clone the
        // quote so React state remains safe if the user needs to retry.
        const result = await signAndSend(structuredClone(preparedTransaction));
        const nextTransactionId = result.transactionId ?? preparedTransaction.transactionId;
        setTransactionId(nextTransactionId);
        setStatus("success");
        await refreshAccount();
        return nextTransactionId;
      } catch (cause) {
        setError(getSendErrorMessage(cause));
        setStatus("error");
        return null;
      } finally {
        submitInFlightRef.current = false;
      }
    },
    [refreshAccount, signAndSend, transaction],
  );

  const reset = React.useCallback(() => {
    setStatus("idle");
    setError(null);
    setTransactionId(null);
    setTransaction(null);
  }, []);

  return {
    prepare,
    execute,
    reset,
    status,
    error,
    transaction,
    transactionId,
    isPreparing: status === "preparing",
    isSigning: status === "signing",
  };
}
