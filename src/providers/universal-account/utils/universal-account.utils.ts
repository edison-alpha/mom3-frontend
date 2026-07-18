import {
  SUPPORTED_TOKEN_TYPE,
  UNIVERSAL_ACCOUNT_VERSION,
  UniversalAccount,
} from "@particle-network/universal-account-sdk";

import { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";
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
      usePrimaryTokens: [
        SUPPORTED_TOKEN_TYPE.ETH,
        SUPPORTED_TOKEN_TYPE.USDT,
        SUPPORTED_TOKEN_TYPE.USDC,
        SUPPORTED_TOKEN_TYPE.BNB,
        SUPPORTED_TOKEN_TYPE.SOL,
      ],
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
  const eip7702Deployments = (deployments as Array<{
    chainId?: number;
    delegationAddress?: string;
    isDelegated?: boolean;
  }>).map((deployment) => ({
    chainId: Number(deployment.chainId || 0),
    delegationAddress: String(deployment.delegationAddress || "0x"),
    isDelegated: deployment.isDelegated === true,
  })).filter((deployment) => deployment.chainId > 0);

  const targetChain = deployments.find(
    (deployment: { chainId?: number | string }) => Number(deployment.chainId) === DEFAULT_CHAIN_ID,
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
