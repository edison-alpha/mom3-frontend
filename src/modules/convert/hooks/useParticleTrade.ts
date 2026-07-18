"use client";

import * as React from "react";
import {
  CHAIN_ID,
  SUPPORTED_TOKEN_TYPE,
  type ITransaction,
} from "@particle-network/universal-account-sdk";

import { getSendErrorMessage, isRetryableParticleTransactionError, isTransactionQuoteExpired } from "@/modules/send/utils/send.utils";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { isParticleExecutionChainId } from "@/providers/shared/constants/chain.constants";

export type TradeStatus = "idle" | "preparing" | "signing" | "success" | "error";

export type ConvertRequest = {
  chainId: number;
  amount: string;
  tokenType: SUPPORTED_TOKEN_TYPE;
};

export function useParticleTrade() {
  const { universalAccount, signAndSend, refreshAccount } = useUniversalAccount();
  const [status, setStatus] = React.useState<TradeStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  const [transaction, setTransaction] = React.useState<ITransaction | null>(null);
  const submitInFlightRef = React.useRef(false);
  const lastRequestRef = React.useRef<ConvertRequest | null>(null);
  const prepareRequestRef = React.useRef(0);

  const prepare = React.useCallback(
    async (request: ConvertRequest) => {
      lastRequestRef.current = request;
      const requestId = ++prepareRequestRef.current;
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
        if (!isParticleExecutionChainId(request.chainId)) {
          throw new Error(`Particle Universal Account does not support chain ${request.chainId}.`);
        }

        const particleTransaction = await universalAccount.createConvertTransaction({
          expectToken: {
            type: request.tokenType,
            amount: request.amount,
          },
          chainId: request.chainId,
        });
        if (requestId !== prepareRequestRef.current) return null;
        const nextTransaction = structuredClone(particleTransaction);

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
        if (requestId === prepareRequestRef.current) {
          setError(getSendErrorMessage(cause));
          setStatus("error");
        }
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
        if (isTransactionQuoteExpired(preparedTransaction)) {
          throw new Error("This conversion quote expired. Preview the conversion again before signing.");
        }
        // Particle injects signatures into the submitted object. Clone the
        // quote so React state remains safe if the user needs to retry.
        const result = await signAndSend(structuredClone(preparedTransaction));
        const nextTransactionId = result.transactionId ?? preparedTransaction.transactionId;
        setTransactionId(nextTransactionId);
        setStatus("success");
        void refreshAccount();
        return nextTransactionId;
      } catch (cause) {
        if (isRetryableParticleTransactionError(cause) && lastRequestRef.current) {
          setTransaction(null);
          setError(null);
          await prepare(lastRequestRef.current);
        } else {
          setError(getSendErrorMessage(cause));
          setStatus("error");
        }
        return null;
      } finally {
        submitInFlightRef.current = false;
      }
    },
    [prepare, refreshAccount, signAndSend, transaction],
  );

  const reset = React.useCallback(() => {
    // Invalidate any quote request that is still resolving. Without this,
    // pressing reset while Particle is preparing can restore the old quote.
    prepareRequestRef.current += 1;
    lastRequestRef.current = null;
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
