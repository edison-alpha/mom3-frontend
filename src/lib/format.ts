import { formatUnits } from "ethers";

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatTokenBalance(balance: number): string {
  if (balance === 0) return "0.00";
  if (balance >= 1) return balance.toFixed(4).replace(/\.?(0+)$/, "");
  return balance.toFixed(6).replace(/\.?(0+)$/, "");
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
    maximumFractionDigits: value > 0 && value < 0.01 ? 6 : 2,
  }).format(value);
}

export type Decimalish = string | number | bigint | null | undefined;

/**
 * Convert a Particle token amount to human units.
 *
 * Particle can return token amounts as decimal strings, base-unit integers,
 * bigint values, or hexadecimal quantities. Hexadecimal and integer strings
 * are always base units; the token's own decimals decide the conversion.
 */
export function parseTokenAmount(value: Decimalish, decimals: number): number {
  if (value === null || value === undefined || value === "") return 0;
  const safeDecimals = Number.isInteger(decimals) && decimals >= 0 ? decimals : 18;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return 0;
    return Number.isInteger(value) && Math.abs(value) >= 10 ** safeDecimals
      ? value / 10 ** safeDecimals
      : value;
  }

  if (typeof value === "bigint") {
    try { return Number(formatUnits(value, safeDecimals)); } catch { return 0; }
  }

  const trimmed = value.trim();
  if (!trimmed) return 0;

  // Hex quantities from Particle are 18-decimal fixed point of the human
  // amount (the token's `decimals` field), regardless of `realDecimals` —
  // e.g. 245716 USDC arrives as 245716 * 10^18. Parse with 18 decimals.
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    try { return Number(formatUnits(BigInt(trimmed), 18)); } catch { return 0; }
  }

  // Integer strings are ambiguous: Particle returns human units for some
  // fields (e.g. tokenChanges) and base units for others (e.g. feeTokens).
  // Prefer the human-unit reading when it stays plausible; otherwise treat
  // the value as base units so raw quantities never leak into the UI.
  if (/^-?\d+$/.test(trimmed)) {
    const asHuman = Number(trimmed);
    if (Number.isFinite(asHuman) && Math.abs(asHuman) < 10 ** 6) return asHuman;
    try { return Number(formatUnits(BigInt(trimmed), safeDecimals)); } catch { return 0; }
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseDecimalish(value: Decimalish, decimals = 18) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "bigint") {
    try {
      return Number(formatUnits(value, decimals));
    } catch {
      return 0;
    }
  }

  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    try {
      return Number(formatUnits(BigInt(trimmed), decimals));
    } catch {
      return 0;
    }
  }

  if (/^\d+$/.test(trimmed)) {
    try {
      return Number(formatUnits(BigInt(trimmed), decimals));
    } catch {
      return 0;
    }
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatUsdValue(value: Decimalish): string {
  return formatUsd(parseUsdDecimalish(value));
}

/** Normalize Particle USD fields without treating decimal strings as raw token units. */
export function parseUsdDecimalish(value: Decimalish): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") {
    try { return Number(formatUnits(value, 18)); } catch { return 0; }
  }

  const trimmed = value.trim();
  if (!trimmed) return 0;
  // Hex USD values are 18-decimal fixed point (e.g. 0x368d04d8a5b7200 ≈ $0.25).
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    try { return Number(formatUnits(BigInt(trimmed), 18)); } catch { return 0; }
  }
  // Plain integer strings are also 18-decimal fixed point when large; small
  // values are already human-readable dollars.
  if (/^-?\d+$/.test(trimmed)) {
    const asHuman = Number(trimmed);
    if (Number.isFinite(asHuman) && Math.abs(asHuman) < 10 ** 6) return asHuman;
    try { return Number(formatUnits(BigInt(trimmed), 18)); } catch { return 0; }
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}
