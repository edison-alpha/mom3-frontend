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
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    try { return Number(formatUnits(BigInt(trimmed), 18)); } catch { return 0; }
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}
