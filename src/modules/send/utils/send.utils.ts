import {
  type IAssetsResponse,
  CHAIN_ID,
  type ITokenWithUSD,
  type ITransaction,
} from "@particle-network/universal-account-sdk";

import {
  receiveTokenTemplates,
  ZERO_ADDRESS,
} from "@/modules/send/constants/send.constants";
import type { Recipient, TokenRow } from "@/modules/send/types/send.types";
import {
  formatTokenBalance,
  formatUsd,
  formatUsdValue,
  parseTokenAmount,
  parseUsdDecimalish,
} from "@/lib/format";
import { chainNameFromId, tokenIcon } from "@/lib/chain";
import { getActiveFeeQuote } from "@/providers/universal-account/utils/gas-sponsorship.utils";

export function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidSolanaAddress(address: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function getTokenUsdPrice(token: TokenRow | null) {
  if (!token) return null;
  if (token.balance > 0 && token.amountInUSD > 0) return token.amountInUSD / token.balance;
  if (["USDC", "USDT"].includes(token.symbol.toUpperCase())) return 1;
  return null;
}

export function getEstimatedAmountInUSD(amount: number, token: TokenRow | null) {
  const price = getTokenUsdPrice(token);
  if (price === null) return null;
  return amount * price;
}

export function normalizePrimaryAssetTokens(
  primaryAssets: IAssetsResponse | null | undefined,
  includeReceiveTokens = false,
): TokenRow[] {
  const rowsById = new Map<string, TokenRow>();

  if (includeReceiveTokens) {
    receiveTokenTemplates.forEach((token) => {
      const id = `${token.chainId}-${token.tokenAddress.toLowerCase()}-${token.symbol}`;
      rowsById.set(id, { ...token, id, balance: 0, amountInUSD: 0 });
    });
  }

  for (const assetItem of primaryAssets?.assets ?? []) {
    const tokenType = String(assetItem.tokenType || "TOKEN").toUpperCase();

    for (const entry of assetItem.chainAggregation) {
      const tokenSymbol = String(entry.token.symbol || tokenType).toUpperCase();
      const chainId = Number(entry.token.chainId ?? 0);
      const tokenAddress = String(entry.token.address ?? ZERO_ADDRESS);
      const token: TokenRow = {
        id: `${chainId}-${tokenAddress.toLowerCase()}-${tokenSymbol}`,
        symbol: tokenSymbol,
        name: String(entry.token.name || tokenSymbol),
        balance: parseTokenAmount(
          entry.amount,
          Number(entry.token.realDecimals ?? entry.token.decimals ?? 18),
        ),
        amountInUSD: parseUsdDecimalish(entry.amountInUSD),
        icon: tokenIcon(tokenSymbol),
        chainName: chainNameFromId(chainId),
        chainId,
        tokenAddress,
      };

      rowsById.set(token.id, token);
    }
  }

  return Array.from(rowsById.values()).sort((left, right) => {
    if (right.amountInUSD !== left.amountInUSD) {
      return right.amountInUSD - left.amountInUSD;
    }
    if (right.balance !== left.balance) return right.balance - left.balance;
    if (Number(Boolean(left.isSuggested)) !== Number(Boolean(right.isSuggested))) {
      return Number(Boolean(left.isSuggested)) - Number(Boolean(right.isSuggested));
    }
    return left.symbol.localeCompare(right.symbol);
  });
}

export function getTransactionFeeQuote(transaction: ITransaction | null) {
  return getActiveFeeQuote(transaction);
}

export type FeeBreakdownRow = {
  label: string;
  value: string;
  originalValue?: string;
};

export function getFeeBreakdownRows(transaction: ITransaction | null) {
  const feeQuote = getTransactionFeeQuote(transaction);
  const totals = feeQuote?.fees.totals;

  if (!totals) {
    return [{ label: "Estimated fees", value: "Unavailable" }];
  }

  const originalGasFee = transaction?.feeQuotes?.[0]?.fees.totals.gasFeeTokenAmountInUSD;
  const rows: FeeBreakdownRow[] = [
    {
      label: feeQuote.fees.freeGasFee
        ? "Network gas"
        : "Network gas · Universal Balance",
      value: feeQuote.fees.freeGasFee
        ? "Sponsored by mom3"
        : formatUsdValue(totals.gasFeeTokenAmountInUSD),
      originalValue:
        feeQuote.fees.freeGasFee && parseUsdDecimalish(originalGasFee) > 0
          ? formatUsdValue(originalGasFee)
          : undefined,
    },
    {
      label: "Service fee",
      value: "Free",
      originalValue: "$0.50",
    },
    {
      label: "LP / settlement",
      value: formatUsdValue(totals.transactionLPFeeTokenAmountInUSD),
    },
  ];

  const solanaRentFee = totals.solanaRentFeeInUSD ?? totals.solanaRentFeeAmountInUSD;
  if (parseUsdDecimalish(solanaRentFee) > 0) {
    rows.push({ label: "Solana rent", value: formatUsdValue(solanaRentFee) });
  }

  if (parseUsdDecimalish(totals.solanaMevTipFeeInUSD) > 0) {
    rows.push({ label: "Solana MEV tip", value: formatUsdValue(totals.solanaMevTipFeeInUSD) });
  }

  return rows;
}

export function getTotalFeeLabel(transaction: ITransaction | null) {
  const feeQuote = getTransactionFeeQuote(transaction);
  return formatUsdValue(
    feeQuote?.fees.totals.feeTokenAmountInUSD ?? transaction?.tokenChanges?.totalFeeInUSD,
  );
}

export function formatTokenChange(item: ITokenWithUSD) {
  const symbol = String(item.token.symbol || item.token.type || "Token").toUpperCase();
  const decimals = ["USDC", "USDT"].includes(symbol)
    ? 6
    : symbol === "SOL"
      ? 9
      : item.token.realDecimals ?? item.token.decimals ?? 18;
  // Particle may return numeric token amounts in base units. Numeric values
  // makes values such as 117491000000 leak into the payment preview.
  const amount = parseTokenAmount(item.amount, decimals);
  const chain = chainNameFromId(Number(item.token.chainId));
  return `${formatTokenBalance(amount)} ${symbol.toUpperCase()} on ${chain}`;
}

export function getFundingRows(transaction: ITransaction | null) {
  if (!transaction) return [];

  const rows =
    transaction.depositTokens?.length > 0
      ? transaction.depositTokens
      : transaction.tokenChanges?.decr ?? [];

  return rows.slice(0, 3).map((item) => ({
    label: formatTokenChange(item),
    value: formatUsdValue(item.amountInUSD),
  }));
}

export function getFeeTokenRows(transaction: ITransaction | null) {
  const feeQuote = getTransactionFeeQuote(transaction);
  return (feeQuote?.fees.feeTokens ?? []).slice(0, 2).map((item) => ({
    label: formatTokenChange(item),
    value: formatUsdValue(item.amountInUSD),
  }));
}


export function normalizeAssetQuery(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function tokenAssetKeys(token: TokenRow) {
  return [token.symbol, token.name].map(normalizeAssetQuery).filter(Boolean);
}

export function sanitizeAmountInput(value: string) {
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const [whole, ...fractions] = normalized.split(".");

  if (fractions.length === 0) return whole;
  return `${whole}.${fractions.join("")}`;
}

export function matchesAsset(token: TokenRow, asset: string, chain = "") {
  const normalizedAsset = normalizeAssetQuery(asset);
  const normalizedChain = normalizeAssetQuery(chain);

  if (!normalizedAsset) return false;

  const assetMatches = tokenAssetKeys(token).some(
    (value) => value === normalizedAsset || value.includes(normalizedAsset),
  );

  if (!assetMatches) return false;
  if (!normalizedChain) return true;

  const tokenChain = normalizeAssetQuery(token.chainName);
  return tokenChain === normalizedChain || tokenChain.includes(normalizedChain);
}

export function findPreferredToken(tokens: TokenRow[], asset: string, chain = "") {
  if (!asset) return null;

  const normalizedAsset = normalizeAssetQuery(asset);
  const normalizedChain = normalizeAssetQuery(chain);

  const exactWithChain = tokens.find((token) => {
    const tokenChain = normalizeAssetQuery(token.chainName);
    return (
      tokenAssetKeys(token).some((value) => value === normalizedAsset) &&
      normalizedChain &&
      (tokenChain === normalizedChain || tokenChain.includes(normalizedChain))
    );
  });
  if (exactWithChain) return exactWithChain;

  const exactWithoutChain = tokens.find((token) =>
    tokenAssetKeys(token).some((value) => value === normalizedAsset),
  );
  if (exactWithoutChain) return exactWithoutChain;

  return (
    tokens.find((token) => matchesAsset(token, asset, chain)) ??
    tokens.find((token) => matchesAsset(token, asset)) ??
    null
  );
}


export function getAmountValidationMessage(
  amount: string,
  selectedToken: TokenRow | null,
  totalPrimaryAssetsInUSD: number | null,
) {
  if (!amount.trim()) return null;

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Enter an amount greater than zero.";
  }

  const estimatedAmountInUSD = getEstimatedAmountInUSD(numericAmount, selectedToken);

  if (
    totalPrimaryAssetsInUSD !== null &&
    estimatedAmountInUSD !== null &&
    estimatedAmountInUSD > totalPrimaryAssetsInUSD
  ) {
    return `Insufficient balance. Required approximately ${formatUsd(estimatedAmountInUSD)}; available ${formatUsd(totalPrimaryAssetsInUSD)}.`;
  }

  return null;
}

export function isRecipientValidForToken(recipient: Recipient, selectedToken: TokenRow) {
  if (selectedToken.chainId === CHAIN_ID.SOLANA_MAINNET) {
    return isValidSolanaAddress(recipient.address);
  }
  return isValidAddress(recipient.address);
}

export function isUserRejectedError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : String(cause);
  return /reject|denied|cancel/i.test(message);
}

export function isTransactionRecordNotFoundError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : JSON.stringify(cause);
  return /no records found|-32608|transaction record/i.test(message);
}

export function isRetryableParticleTransactionError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : JSON.stringify(cause);
  return /no records found|-32608|transaction record|aa24|signature error|expired/i.test(message);
}

export function isTransactionQuoteExpired(
  transaction: ITransaction | null,
  safetyWindowMs = 20_000,
) {
  if (!transaction) return true;

  const expirations = (transaction.userOps ?? [])
    .map((userOp) => Number(userOp.expiredAt))
    .filter((expiredAt) => Number.isFinite(expiredAt) && expiredAt > 0)
    .map((expiredAt) => (expiredAt < 10_000_000_000 ? expiredAt * 1_000 : expiredAt));

  if (expirations.length === 0) return false;
  return Math.min(...expirations) <= Date.now() + safetyWindowMs;
}

export function getSendErrorMessage(cause: unknown) {
  const message = cause instanceof Error ? cause.message : String(cause || "");
  const normalized = message.toLowerCase();

  if (isUserRejectedError(cause)) {
    return "Request cancelled. No funds were moved.";
  }
  if (
    normalized.includes("gas sponsorship") ||
    normalized.includes("paymaster") ||
    normalized.includes("aa31")
  ) {
    return "Gas sponsorship is temporarily unavailable. No funds were moved. Please try again later.";
  }
  if (
    normalized.includes("insufficient") ||
    normalized.includes("insufficient balance") ||
    normalized.includes("cover the fee") ||
    normalized.includes("-32676")
  ) {
    const feeShortfall = message.match(/need(?:ed)?\s+\$([0-9]+(?:\.[0-9]+)?)\s+more/i);
    return feeShortfall
      ? `Insufficient balance to cover the network fee. You need $${feeShortfall[1]} more in the fee token.`
      : "Insufficient balance to cover the amount and network fee.";
  }
  if (normalized.includes("blockhash")) {
    return "The network state changed before submission. Review the refreshed quote and try again.";
  }
  if (
    normalized.includes("chainid 0") ||
    normalized.includes("source network") ||
    normalized.includes("eip-7702 upgrade")
  ) {
    return "Your wallet needs a one-time network upgrade before this payment can be sent. Complete the upgrade and try again.";
  }
  if (
    normalized.includes("does not support chain") ||
    normalized.includes("unsupported chain") ||
    normalized.includes("no eip-7702 deployment") ||
    normalized.includes("did not return eip-7702 authorization")
  ) {
    const chainMatch = message.match(/chain(?:\s+id)?\s*[:=]?\s*(\d+)/i);
    const chainSuffix = chainMatch?.[1] ? ` (chain ${chainMatch[1]})` : "";
    return `This network is not available for this Universal Account action${chainSuffix}. Choose another supported network.`;
  }
  if (
    normalized.includes("timeout") ||
    normalized.includes("network error") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("connection") ||
    normalized.includes("offline")
  ) {
    return "The network request timed out. Check your connection and try again.";
  }
  if (normalized.includes("no records found") || normalized.includes("-32608")) {
    return "This quote is no longer available. Review the refreshed transaction details and confirm again.";
  }
  if (normalized.includes("aa24") || normalized.includes("signature error")) {
    return "The wallet signature could not be verified. Review the refreshed quote and confirm again.";
  }
  if (normalized.includes("maintenance") || normalized.includes("maintanence")) {
    return "Payments are temporarily unavailable. Your funds are safe. Please try again later.";
  }
  if (normalized.includes("not ready")) {
    return "Your wallet is not ready. Reconnect your wallet and try again.";
  }
  if (normalized.includes("incomplete") || normalized.includes("without a useroperation")) {
    return "We couldn't prepare complete transaction details. Refresh and try again.";
  }

  return "We couldn't send this transaction. Please try again.";
}

export function matchesRecipient(recipient: Recipient, query: string) {
  const normalized = query.toLowerCase();
  return (
    recipient.handle.toLowerCase().includes(normalized) ||
    recipient.name.toLowerCase().includes(normalized) ||
    recipient.address.toLowerCase().includes(normalized) ||
    recipient.network.toLowerCase().includes(normalized)
  );
}

export function createExternalRecipient(address: string): Recipient {
  const isSolana = isValidSolanaAddress(address);
  return {
    id: `external-${address}`,
    handle: "Wallet address",
    name: "External wallet",
    address,
    network: isSolana ? "Solana" : "EVM",
    status: "External",
    color: "from-[#1C1C1E] to-[#3B33BD]",
  };
}

export function resolveRecipient(query: string, candidates: Recipient[] = []): Recipient | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const known = candidates.find((recipient) => {
    return (
      recipient.handle.toLowerCase() === trimmed.toLowerCase() ||
      recipient.handle.toLowerCase().includes(trimmed.toLowerCase()) ||
      recipient.name.toLowerCase().includes(trimmed.toLowerCase())
    );
  });

  if (known) return known;

  if (isValidAddress(trimmed) || isValidSolanaAddress(trimmed)) {
    return createExternalRecipient(trimmed);
  }

  return null;
}

export { ZERO_ADDRESS };
