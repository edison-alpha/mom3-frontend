import {
  PREFER_TOKEN_TYPE,
  SUPPORTED_TOKEN_TYPE,
  UNIVERSAL_ACCOUNT_VERSION,
  UniversalAccount,
} from "@particle-network/universal-account-sdk";

import {
  DEFAULT_CHAIN_ID,
  PARTICLE_EVM_CHAIN_IDS,
} from "@/providers/shared/constants/chain.constants";
import type {
  UniversalAccountSnapshot,
} from "@/providers/universal-account/types/universal-account.types";

export function createUniversalAccount(ownerAddress: string) {
  const projectId = process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID;
  const projectClientKey = process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY;
  const projectAppUuid = process.env.NEXT_PUBLIC_PARTICLE_APP_ID;

  if (!projectId || !projectClientKey || !projectAppUuid) {
    throw new Error("Particle configuration is incomplete.");
  }

  return new UniversalAccount({
    projectId,
    projectClientKey,
    projectAppUuid,
    smartAccountOptions: {
      useEIP7702: true,
      name: "UNIVERSAL",
      // Keep the account contract version coupled to the installed Particle
      // SDK. An environment override can silently point quotes at an older UA.
      version: UNIVERSAL_ACCOUNT_VERSION,
      ownerAddress,
    },
    tradeConfig: {
      slippageBps: 100,
      // Keep Universal Gas on the same Primary Asset set used by the Solana
      // yield flow. USD assets are preferred for fees, while SOL remains the
      // native fallback for rent/account creation.
      usePrimaryTokens: [
        SUPPORTED_TOKEN_TYPE.USDC,
        SUPPORTED_TOKEN_TYPE.USDT,
        SUPPORTED_TOKEN_TYPE.SOL,
        SUPPORTED_TOKEN_TYPE.ETH,
        SUPPORTED_TOKEN_TYPE.BNB,
      ],
      preferTokenType: PREFER_TOKEN_TYPE.USD,
    },
  });
}

export async function loadUniversalAccountSnapshot(
  universalAccount: UniversalAccount,
  ownerAddress: string,
): Promise<UniversalAccountSnapshot> {
  const [options, assets, rawDeployments] = await Promise.all([
    universalAccount.getSmartAccountOptions(),
    universalAccount.getPrimaryAssets(),
    universalAccount.getEIP7702Deployments(),
  ]);

  const deployments = Array.isArray(rawDeployments) ? rawDeployments : [];
  const deploymentRows = deployments as Array<{
    chainId?: number | string;
    chain_id?: number | string;
    delegationAddress?: string;
    delegation_address?: string;
    isDelegated?: boolean;
  }>;

  // The deployments endpoint can contain only chains whose status has already
  // been refreshed. Build the UI from the SDK-supported EVM chains as well and
  // resolve the authorization address for missing rows.
  const deploymentByChain = new Map(
    deploymentRows.map((deployment) => [
      Number(deployment.chainId ?? deployment.chain_id ?? 0),
      deployment,
    ]),
  );
  const supportedChains = Array.from(
    new Set([...deploymentByChain.keys(), ...PARTICLE_EVM_CHAIN_IDS]),
  ).filter((chainId) => chainId > 0);
  const missingAuthorizationRows = await Promise.all(
    supportedChains
      .filter((chainId) => !deploymentByChain.has(chainId))
      .map(async (chainId) => {
        try {
          const [auth] = (await universalAccount.getEIP7702Auth([chainId])) as Array<{
            address?: string;
          }>;
          return [chainId, { chainId, delegationAddress: auth?.address || "0x" }] as const;
        } catch {
          return [chainId, { chainId, delegationAddress: "0x" }] as const;
        }
      }),
  );
  for (const [chainId, deployment] of missingAuthorizationRows) {
    deploymentByChain.set(chainId, deployment);
  }

  const eip7702Deployments = Array.from(deploymentByChain.values()).map((deployment) => ({
    chainId: Number(deployment.chainId ?? deployment.chain_id ?? 0),
    delegationAddress: String(
      deployment.delegationAddress ?? deployment.delegation_address ?? "0x",
    ),
    isDelegated: deployment.isDelegated === true,
  })).filter((deployment) => deployment.chainId > 0);

  const targetChain = deployments.find(
    (deployment: { chainId?: number | string; chain_id?: number | string }) =>
      Number(deployment.chainId ?? deployment.chain_id) === DEFAULT_CHAIN_ID,
  );

  return {
    accountInfo: {
      ownerAddress,
      evmSmartAccount: options.smartAccountAddress || ownerAddress,
      solanaSmartAccount: options.solanaSmartAccountAddress || "",
    },
    isDelegated: Boolean((targetChain as { isDelegated?: boolean } | undefined)?.isDelegated),
    eip7702Deployments,
    primaryAssets: assets,
  };
}
