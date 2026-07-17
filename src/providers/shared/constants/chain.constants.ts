export const DEFAULT_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_PARTICLE_7702_CHAIN_ID ||
    process.env.NEXT_PUBLIC_MAGIC_CHAIN_ID ||
    process.env.NEXT_PUBLIC_BASE_CHAIN_ID ||
    42161,
);

export const PARTICLE_EXECUTION_CHAIN_IDS = [42161, 8453, 101] as const;

export function isParticleExecutionChainId(chainId: number) {
  return PARTICLE_EXECUTION_CHAIN_IDS.includes(chainId as (typeof PARTICLE_EXECUTION_CHAIN_IDS)[number]);
}
