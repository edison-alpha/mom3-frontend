"use client";

import {
  CHAIN_ID,
  SUPPORTED_TOKEN_TYPE,
  type IAssetsResponse,
  type ITransaction,
} from "@particle-network/universal-account-sdk";
import * as React from "react";

import type { AiExecutionIntent } from "@/modules/ai/types/ai.types";
import { isTransactionQuoteExpired } from "@/modules/send/utils/send.utils";
import type { YieldAction } from "@/modules/yield-execution/types/yield-execution.types";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import { syncHistory } from "@/modules/history/api/history.api";
import { parseDecimalish } from "@/lib/format";
import { getActiveFeeQuote } from "@/providers/universal-account/utils/gas-sponsorship.utils";

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
// Kamino creates user-owned Solana accounts during the first supply. Particle
// can source this reserve across chains, but its quote does not always expose
// the account-rent amount before those accounts exist.
const KAMINO_SOLANA_SETUP_RESERVE = 0.03;

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function getErrorDetails(cause: unknown, depth = 0): string {
  if (depth > 2 || cause == null) return "";
  if (typeof cause === "string") return cause;
  if (typeof cause !== "object") return String(cause);

  const value = cause as {
    message?: unknown;
    code?: unknown;
    error?: unknown;
    reason?: unknown;
    details?: unknown;
    data?: unknown;
    extraData?: unknown;
    cause?: unknown;
  };
  return [
    typeof value.message === "string" ? value.message : "",
    typeof value.code === "string" || typeof value.code === "number" ? `code=${String(value.code)}` : "",
    typeof value.reason === "string" ? value.reason : "",
    typeof value.error === "string" ? value.error : "",
    typeof value.details === "string" ? value.details : "",
    getErrorDetails(value.data, depth + 1),
    getErrorDetails(value.extraData, depth + 1),
    getErrorDetails(value.cause, depth + 1),
  ].filter(Boolean).join(" ");
}

function getYieldExecutionError(cause: unknown, action: YieldAction, phase: "prepare" | "submit") {
  const details = getErrorDetails(cause);

  if (/insufficient primary token balance|code=-32653/i.test(details)) {
    return "Your Universal Account does not have enough primary-token balance to pay this transaction fee. Add SOL or another supported primary asset, then review this transaction again.";
  }
  if (/insufficient lamports|insufficient funds for rent|insufficient.*rent/i.test(details)) {
    return "This Solana operation needs lamports for rent/account creation in addition to transaction gas. Review again so Particle can source the SOL reserve from your Universal Account; add SOL only if the Universal Account has no available SOL route.";
  }
  if (/delegat|eip.?7702|universal account/i.test(details)) {
    return `Your Universal Account is not delegated on this chain. Complete delegation, then review the ${action} again.`;
  }

  if (details) return `Particle ${phase} error: ${details}`;
  return `We couldn't ${phase} this ${action}.`;
}

function getSolanaBalance(primaryAssets: IAssetsResponse | null) {
  const solAsset = primaryAssets?.assets.find(
    (asset) => String(asset.tokenType).toLowerCase() === SUPPORTED_TOKEN_TYPE.SOL,
  );
  return (solAsset?.chainAggregation ?? [])
    .filter((entry) => Number(entry.token.chainId) === CHAIN_ID.SOLANA_MAINNET)
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
}

function getPrimaryBalance(primaryAssets: IAssetsResponse | null, tokenType: SUPPORTED_TOKEN_TYPE, chainId: number) {
  const asset = primaryAssets?.assets.find(
    (entry) => String(entry.tokenType).toLowerCase() === String(tokenType).toLowerCase(),
  );
  return (asset?.chainAggregation ?? [])
    .filter((entry) => Number(entry.token.chainId) === chainId)
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
}

function getSolanaReserveTopUp(primaryAssets: IAssetsResponse | null) {
  const available = getSolanaBalance(primaryAssets);
  const topUp = KAMINO_SOLANA_SETUP_RESERVE - available;
  return topUp > 0.000000001 ? topUp.toFixed(9).replace(/0+$/, "").replace(/\.$/, "") : null;
}

function getSolanaRentTopUp(
  transaction: ITransaction,
  primaryAssets: IAssetsResponse | null,
  alreadyRequested = 0,
) {
  const quotedRent = parseDecimalish(
    getActiveFeeQuote(transaction)?.fees.totals.solanaRentFee,
    9,
  );
  const available = getSolanaBalance(primaryAssets);
  const requiredReserve = Math.max(quotedRent, KAMINO_SOLANA_SETUP_RESERVE);
  const topUp = requiredReserve - available - alreadyRequested;

  // Particle expects human-readable token amounts. The initial Kamino reserve
  // covers account rent even when Particle has not reported it in feeQuotes.
  return topUp > 0.000000001 ? topUp.toFixed(9).replace(/0+$/, "").replace(/\.$/, "") : null;
}

export function useYieldExecution(action: YieldAction) {
  const { accountInfo, primaryAssets, universalAccount, signAndSend, refreshAccount } = useUniversalAccount();
  const [status, setStatus] = React.useState<ExecutionStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [transaction, setTransaction] = React.useState<any>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);
  const [intent, setIntent] = React.useState<AiExecutionIntent | null>(null);
  const [conversionTransaction, setConversionTransaction] = React.useState<ITransaction | null>(null);
  const executeInFlightRef = React.useRef(false);

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
    setConversionTransaction(null);

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

      const expectTokens = action === "supply"
        ? [{ type: expectedTokenType, amount: validated.amount }]
        : [];
      // Solana rent is not transaction gas. The first Particle simulation must
      // know that SOL is also an expected output before it can build a quote;
      // adding it only after createUniversalTransaction() has failed is too
      // late for first-time ATA/Kamino account creation.
      const solanaReserveTopUp = action === "supply"
        && chainId === CHAIN_ID.SOLANA_MAINNET
        && expectedTokenType !== SUPPORTED_TOKEN_TYPE.SOL
        ? getSolanaReserveTopUp(primaryAssets)
        : null;
      const particleExpectTokens = solanaReserveTopUp
        ? [...expectTokens, { type: SUPPORTED_TOKEN_TYPE.SOL, amount: solanaReserveTopUp }]
        : expectTokens;
      // Solana lending markets need the target asset on Solana before the
      // Kamino instructions can run. Convert the missing amount through the
      // same Universal Account first; this is intentionally a separate
      // Particle transaction because convert quotes cannot be embedded in
      // Kamino's instruction list.
      if (action === "supply" && chainId === CHAIN_ID.SOLANA_MAINNET) {
        const missing = Number(validated.amount) - getPrimaryBalance(primaryAssets, expectedTokenType, chainId);
        if (missing > 0.000000001) {
          const convert = await universalAccount.createConvertTransaction({
            expectToken: { type: expectedTokenType, amount: missing.toString() },
            chainId,
          });
          setConversionTransaction(structuredClone(convert));
        }
      }
      let particleTransaction = await universalAccount.createUniversalTransaction({
        chainId,
        expectTokens: particleExpectTokens,
        transactions: validated.transactions,
      });

      // A direct send only needs transaction gas, which Particle can source
      // from any primary asset. Kamino's first supply can additionally create
      // Solana accounts. When Particle includes that rent in its quote, source
      // only the missing SOL from the same Universal Balance before submitting.
      if (action === "supply" && chainId === CHAIN_ID.SOLANA_MAINNET) {
        const rentTopUp = getSolanaRentTopUp(
          particleTransaction,
          primaryAssets,
          Number(solanaReserveTopUp || 0),
        );
        if (rentTopUp) {
          particleTransaction = await universalAccount.createUniversalTransaction({
            chainId,
            expectTokens: [
              ...expectTokens,
              {
                type: SUPPORTED_TOKEN_TYPE.SOL,
                amount: (Number(solanaReserveTopUp || 0) + Number(rentTopUp)).toFixed(9)
                  .replace(/0+$/, "")
                  .replace(/\.$/, ""),
              },
            ],
            transactions: validated.transactions,
          });
        }
      }
      const nextTransaction = structuredClone(particleTransaction);
      setIntent(validated);
      setTransaction(nextTransaction);
      setStatus("idle");
      return nextTransaction;
    } catch (cause) {
      setError(getYieldExecutionError(cause, action, "prepare"));
      setStatus("error");
      return null;
    }
  }, [accountInfo.evmSmartAccount, accountInfo.solanaSmartAccount, action, primaryAssets, universalAccount]);

  const execute = React.useCallback(async () => {
    if (!transaction || executeInFlightRef.current) return null;
    executeInFlightRef.current = true;
    if (isTransactionQuoteExpired(transaction)) {
      setError("This Particle quote has expired. Review the transaction again to refresh route and fees.");
      setTransaction(null);
      setStatus("error");
      executeInFlightRef.current = false;
      return null;
    }
    setStatus("signing");
    setError(null);
    try {
      if (conversionTransaction) {
        await signAndSend(structuredClone(conversionTransaction));
        setConversionTransaction(null);
        await refreshAccount();
        await wait(1_500);
        const refreshed = await prepare(intent?.market_id || "", intent?.amount || "", intent?.chain_id || 101);
        if (!refreshed) return null;
        const result = await signAndSend(refreshed);
        const id = result.transactionId ?? refreshed.transactionId ?? null;
        setTransactionId(id);
        setStatus("success");
        void refreshAccount();
        return id;
      }
      const result = await signAndSend(transaction);
      const id = result.transactionId ?? transaction.transactionId ?? null;
      setTransactionId(id);
      setStatus("success");
      const account = accountInfo.evmSmartAccount || accountInfo.solanaSmartAccount;
      if (account && universalAccount) {
        void (async () => {
          // Particle can expose the transaction a few seconds after submit.
          // Seed history immediately with the validated execution action so
          // supply/withdraw is never classified as a generic transaction.
          await syncHistory(account, [{
            transactionId: id,
            id,
            action,
            type: action,
            protocol: intent?.protocol || "Yield",
            chainId: intent?.chain_id,
            status: "pending",
            amount: Number(intent?.amount || 0),
            targetToken: { symbol: intent?.asset?.symbol || "" },
          }]);

          for (let attempt = 0; attempt < 6; attempt += 1) {
            await wait(2_000);
            const response = await universalAccount.getTransactions(1, 50);
            const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
            if (transactions.some((item: any) => String(item?.transactionId || item?.id || item?.hash) === String(id))) {
              await syncHistory(account, transactions);
              return;
            }
          }
        })().catch(() => undefined);
      }
      void refreshAccount();
      return id;
    } catch (cause) {
      // Particle quotes are single-use and must never be re-submitted after a
      // failed signing/submission attempt. Force a fresh quote on re-entry.
      setTransaction(null);
      setError(getYieldExecutionError(cause, action, "submit"));
      setStatus("error");
      return null;
    } finally {
      executeInFlightRef.current = false;
    }
  }, [accountInfo.evmSmartAccount, accountInfo.solanaSmartAccount, action, conversionTransaction, intent, prepare, refreshAccount, signAndSend, transaction, universalAccount]);

  const reset = React.useCallback(() => {
    setStatus("idle");
    setError(null);
    setTransaction(null);
    setTransactionId(null);
    setIntent(null);
    setConversionTransaction(null);
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
