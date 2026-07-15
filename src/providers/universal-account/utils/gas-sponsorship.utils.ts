import {
  createMultiChainUnsignedData,
  type IFeeQuote,
  type ITransaction,
} from "@particle-network/universal-account-sdk";

const SPONSORSHIP_MARKER = "particle-omnichain-paymaster";

export class GasSponsorshipUnavailableError extends Error {
  constructor() {
    super(
      "Gas sponsorship is temporarily unavailable. No funds were moved. Please try again after the mom3 Paymaster is funded.",
    );
    this.name = "GasSponsorshipUnavailableError";
  }
}

export function isGasSponsorshipRequired() {
  return process.env.NEXT_PUBLIC_PARTICLE_REQUIRE_GAS_SPONSORSHIP === "true";
}

export function getSponsoredFeeQuote(
  transaction: ITransaction | null | undefined,
): IFeeQuote | null {
  const quote = transaction?.gasless;

  if (!quote?.fees?.freeGasFee || !Array.isArray(quote.userOps) || quote.userOps.length === 0) {
    return null;
  }

  return quote;
}

export function isGasSponsored(transaction: ITransaction | null | undefined) {
  return Boolean(getSponsoredFeeQuote(transaction));
}

/**
 * Particle returns user-paid and Paymaster-sponsored UserOperations together.
 * The SDK defaults to feeQuotes[0], so rebuild the unsigned root from the
 * sponsored UserOperations before asking the owner wallet to sign.
 */
export function prepareSponsoredTransaction(
  transaction: ITransaction,
  options: { required?: boolean } = {},
): ITransaction {
  if (
    transaction.additionalData?.mom3GasSponsorship === SPONSORSHIP_MARKER &&
    transaction.userOps.length > 0
  ) {
    return structuredClone(transaction);
  }

  const sponsoredQuote = getSponsoredFeeQuote(transaction);
  const required = options.required ?? isGasSponsorshipRequired();

  if (!sponsoredQuote) {
    if (required) throw new GasSponsorshipUnavailableError();
    return structuredClone(transaction);
  }

  const nextTransaction = structuredClone(transaction);
  const nextSponsoredQuote = nextTransaction.gasless;

  if (!nextSponsoredQuote) throw new GasSponsorshipUnavailableError();

  const unsignedData = createMultiChainUnsignedData(nextSponsoredQuote.userOps) as {
    merkleRoot: string;
    data: ITransaction["data"];
  };

  return {
    ...nextTransaction,
    // sendTransaction signs `userOps` directly. Preserve feeQuotes only so the
    // review UI can show the original gas estimate crossed out.
    userOps: nextSponsoredQuote.userOps,
    rootHash: unsignedData.merkleRoot,
    data: unsignedData.data,
    transactionFees: {
      ...nextTransaction.transactionFees,
      freeGasFee: true,
    },
    additionalData: {
      ...nextTransaction.additionalData,
      mom3GasSponsorship: SPONSORSHIP_MARKER,
    },
  };
}

export function getActiveFeeQuote(
  transaction: ITransaction | null | undefined,
): IFeeQuote | null {
  if (!transaction) return null;

  return (
    getSponsoredFeeQuote(transaction) ??
    transaction.feeQuotes?.[0] ??
    transaction.gasless ??
    null
  );
}
