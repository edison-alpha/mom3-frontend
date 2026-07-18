import {
  UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS,
} from "@particle-network/universal-account-sdk";

export const DEFAULT_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_PARTICLE_7702_CHAIN_ID ||
    process.env.NEXT_PUBLIC_MAGIC_CHAIN_ID ||
    process.env.NEXT_PUBLIC_BASE_CHAIN_ID ||
    42161,
);

// This is the SDK's actual Universal Account v2 chain contract. Primary token
// availability is not the same thing as Universal Account/EIP-7702 support.
export const PARTICLE_CHAIN_IDS = Array.from(
  new Set(UNIVERSAL_ACCOUNT_VERSION_V2_SUPPORTED_CHAIN_IDS.map(Number)),
).filter((chainId) => Number.isSafeInteger(chainId) && chainId > 0);

export const PARTICLE_EVM_CHAIN_IDS = PARTICLE_CHAIN_IDS.filter((chainId) => chainId !== 101);

export const PARTICLE_EXECUTION_CHAIN_IDS = PARTICLE_CHAIN_IDS;

export function isParticleExecutionChainId(chainId: number) {
  return PARTICLE_EXECUTION_CHAIN_IDS.includes(chainId);
}

export function isParticleEvmChainId(chainId: number) {
  return PARTICLE_EVM_CHAIN_IDS.includes(chainId);
}
