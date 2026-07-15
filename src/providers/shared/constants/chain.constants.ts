export const DEFAULT_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_PARTICLE_7702_CHAIN_ID ||
    process.env.NEXT_PUBLIC_MAGIC_CHAIN_ID ||
    process.env.NEXT_PUBLIC_BASE_CHAIN_ID ||
    42161,
);

export const MVP_CHAIN_IDS = [42161, 8453, 101] as const;

export function isMvpChainId(chainId: number) {
  return MVP_CHAIN_IDS.includes(chainId as (typeof MVP_CHAIN_IDS)[number]);
}
