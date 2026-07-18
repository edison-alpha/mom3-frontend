import type { ITokenWithUSD, ITransaction } from "@particle-network/universal-account-sdk";

import { chainNameFromId } from "@/lib/chain";
import { formatTokenBalance, formatUsdValue, parseDecimalish, parseUsdDecimalish } from "@/lib/format";
import { getActiveFeeQuote } from "@/providers/universal-account/utils/gas-sponsorship.utils";

export type FeeBreakdownRow = { label: string; value: string; originalValue?: string };

function formatFeeToken(item: ITokenWithUSD) {
  const decimals = item.token.realDecimals ?? item.token.decimals ?? 18;
  const amount = parseDecimalish(item.amount, decimals);
  const symbol = item.token.symbol || item.token.type || "Token";
  return `${formatTokenBalance(amount)} ${symbol.toUpperCase()} on ${chainNameFromId(Number(item.token.chainId))}`;
}

export function getTransactionFeeQuote(transaction: ITransaction | null) {
  return getActiveFeeQuote(transaction);
}

export function getFeeBreakdownRows(transaction: ITransaction | null): FeeBreakdownRow[] {
  const feeQuote = getTransactionFeeQuote(transaction);
  const totals = feeQuote?.fees.totals;
  if (!totals) return [{ label: "Estimated fees", value: "Unavailable" }];

  const originalGasFee = transaction?.feeQuotes?.[0]?.fees.totals.gasFeeTokenAmountInUSD;
  const rows: FeeBreakdownRow[] = [{
    label: feeQuote.fees.freeGasFee ? "Network gas" : "Network gas · Universal Balance",
    value: feeQuote.fees.freeGasFee ? "Sponsored by mom3" : formatUsdValue(totals.gasFeeTokenAmountInUSD),
    originalValue: feeQuote.fees.freeGasFee && parseUsdDecimalish(originalGasFee) > 0 ? formatUsdValue(originalGasFee) : undefined,
  }, {
    label: "Service fee",
    value: feeQuote.fees.freeServiceFee ? "Free" : formatUsdValue(totals.transactionServiceFeeTokenAmountInUSD),
  }, {
    label: "LP / settlement",
    value: formatUsdValue(totals.transactionLPFeeTokenAmountInUSD),
  }];

  const solanaRentFee = totals.solanaRentFeeInUSD ?? totals.solanaRentFeeAmountInUSD;
  if (parseUsdDecimalish(solanaRentFee) > 0) rows.push({ label: "Solana rent", value: formatUsdValue(solanaRentFee) });
  if (parseUsdDecimalish(totals.solanaMevTipFeeInUSD) > 0) rows.push({ label: "Solana MEV tip", value: formatUsdValue(totals.solanaMevTipFeeInUSD) });
  return rows;
}

export function getTotalFeeLabel(transaction: ITransaction | null) {
  const feeQuote = getTransactionFeeQuote(transaction);
  return formatUsdValue(feeQuote?.fees.totals.feeTokenAmountInUSD ?? transaction?.tokenChanges?.totalFeeInUSD);
}

export function getFeeTokenRows(transaction: ITransaction | null) {
  const feeQuote = getTransactionFeeQuote(transaction);
  return (feeQuote?.fees.feeTokens ?? []).slice(0, 2).map((item) => ({
    label: formatFeeToken(item),
    value: formatUsdValue(item.amountInUSD),
  }));
}
