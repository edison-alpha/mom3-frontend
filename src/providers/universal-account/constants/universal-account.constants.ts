export { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";

export const universalAccountQueryKeys = {
  root: ["universal-account"] as const,
  instance: (ownerAddress?: string) =>
    ["universal-account", "instance", ownerAddress || "anonymous"] as const,
  snapshot: (ownerAddress?: string) =>
    ["universal-account", "snapshot", ownerAddress || "anonymous"] as const,
  transaction: (transactionId?: string) =>
    ["universal-account", "transaction", transactionId || "pending"] as const,
};
