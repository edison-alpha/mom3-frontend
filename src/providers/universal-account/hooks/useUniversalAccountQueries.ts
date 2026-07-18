"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BrowserProvider, Signature, getBytes, verifyMessage } from "ethers";

import type { Mom3Magic } from "@/providers/magic/types/magic.types";
import { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";
import { universalAccountQueryKeys } from "@/providers/universal-account/constants/universal-account.constants";
import type { SignAndSendTransaction } from "@/providers/universal-account/types/universal-account.types";
import {
  createUniversalAccount,
  loadUniversalAccountSnapshot,
} from "@/providers/universal-account/utils/universal-account.utils";
import { isTransactionQuoteExpired } from "@/modules/send/utils/send.utils";

type Eip7702Deployment = {
  chainId?: number;
  isDelegated?: boolean;
};

type Eip7702Auth = {
  address?: string;
  chainId?: number;
  nonce?: number | string;
};

const DELEGATION_POLL_INTERVAL_MS = 2_000;
const DELEGATION_POLL_ATTEMPTS = 15;

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function isDelegatedOnChain(
  universalAccount: NonNullable<ReturnType<typeof useUniversalAccountInstanceQuery>["data"]>,
  chainId: number,
) {
  const rawDeployments = await universalAccount.getEIP7702Deployments();
  const deployments = Array.isArray(rawDeployments)
    ? (rawDeployments as Eip7702Deployment[])
    : [];
  const deployment = deployments.find((item) => Number(item.chainId) === chainId);
  if (!deployment) {
    throw new Error(`Particle does not provide an EIP-7702 deployment for chain ${chainId}.`);
  }
  return deployment.isDelegated === true;
}

export function useUniversalAccountInstanceQuery(ownerAddress?: string) {
  return useQuery({
    queryKey: universalAccountQueryKeys.instance(ownerAddress),
    queryFn: () => createUniversalAccount(ownerAddress as string),
    enabled: Boolean(ownerAddress),
    gcTime: Infinity,
    staleTime: Infinity,
  });
}

export function useUniversalAccountSnapshotQuery(
  universalAccount: ReturnType<typeof useUniversalAccountInstanceQuery>["data"],
  ownerAddress?: string,
) {
  return useQuery({
    queryKey: universalAccountQueryKeys.snapshot(ownerAddress),
    queryFn: () =>
      loadUniversalAccountSnapshot(
        universalAccount as NonNullable<typeof universalAccount>,
        ownerAddress as string,
      ),
    enabled: Boolean(ownerAddress && universalAccount),
    staleTime: 5_000,
    // WebSocket invalidations are an optimisation. Polling keeps balance
    // correct when the realtime gateway is unavailable or misconfigured.
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });
}

export function useEnsureDelegatedMutation(
  universalAccount: ReturnType<typeof useUniversalAccountInstanceQuery>["data"],
  magic: Mom3Magic | null,
  ownerAddress?: string,
) {
  const queryClient = useQueryClient();

  const signEip7702Auth = async (contractAddress: string, chainId: number, nonce?: number) => {
    if (!magic) throw new Error("Magic wallet is not ready.");

    return magic.wallet.sign7702Authorization({
      contractAddress,
      chainId,
      ...(nonce !== undefined ? { nonce } : {}),
    });
  };

  return useMutation({
    mutationFn: async (chainId: number = DEFAULT_CHAIN_ID) => {
      if (!universalAccount || !magic || !ownerAddress) {
        throw new Error("Universal Account or Magic wallet is not ready.");
      }

      if (await isDelegatedOnChain(universalAccount, chainId)) return false;

      await magic.evm.switchChain(chainId);

      const [auth] = (await universalAccount.getEIP7702Auth([chainId])) as Eip7702Auth[];
      const authNonce = Number(auth?.nonce);

      if (
        Number(auth?.chainId) !== chainId ||
        !auth?.address ||
        !Number.isSafeInteger(authNonce) ||
        authNonce < 0
      ) {
        throw new Error(`Particle did not return EIP-7702 authorization for chain ${chainId}.`);
      }

      // For an explicit Type-4 transaction the EOA is both the transaction
      // sender and the authorization authority. EIP-7702 processes the auth
      // after incrementing the sender nonce, therefore Magic's official demo
      // signs auth.nonce + 1 here. Inline Particle authorizations below keep
      // the original nonce because a relayer submits that outer transaction.
      const authorization = await signEip7702Auth(
        auth.address,
        chainId,
        authNonce + 1,
      );

      const result = await magic.wallet.send7702Transaction({
        to: ownerAddress,
        data: "0x",
        authorizationList: [authorization],
      });

      const transactionHash = String(result?.transactionHash || "");
      if (transactionHash) {
        const provider = new BrowserProvider(magic.rpcProvider as any);
        const receipt = await provider.waitForTransaction(transactionHash, 1, 60_000);
        if (!receipt || receipt.status !== 1) {
          throw new Error("The EIP-7702 upgrade could not be confirmed on-chain.");
        }
      }

      for (let attempt = 0; attempt < DELEGATION_POLL_ATTEMPTS; attempt += 1) {
        if (await isDelegatedOnChain(universalAccount, chainId)) return true;
        await wait(DELEGATION_POLL_INTERVAL_MS);
      }

      throw new Error(
        "The upgrade was submitted, but Particle has not updated the delegation status yet. Refresh your account and try again.",
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: universalAccountQueryKeys.snapshot(ownerAddress),
      });
    },
  });
}

export function useSignAndSend(
  universalAccount: ReturnType<typeof useUniversalAccountInstanceQuery>["data"],
  magic: Mom3Magic | null,
  ownerAddress?: string,
): SignAndSendTransaction {
  return async (transaction) => {
    if (!universalAccount || !magic || !ownerAddress) {
      throw new Error("Universal Account or Magic wallet is not ready.");
    }

    // Particle's SDK already returns the final sponsored/user-paid
    // UserOperation. Do not rebuild gasless data or rootHash before signing;
    // the Bundler verifies the signature against this exact quote.
    const transactionForSubmit = structuredClone(transaction);

    if (isTransactionQuoteExpired(transactionForSubmit)) {
      throw new Error("This Particle quote expired before signing. Request a fresh quote and try again.");
    }

    if (
      !transactionForSubmit.transactionId ||
      !/^0x[0-9a-fA-F]{64}$/.test(transactionForSubmit.rootHash)
    ) {
      throw new Error("Particle returned an invalid quote without a root hash.");
    }
    if (
      !Array.isArray(transactionForSubmit.userOps) ||
      transactionForSubmit.userOps.length === 0
    ) {
      throw new Error("Particle returned a quote without a UserOperation.");
    }

    const authorizations: Array<{ userOpHash: string; signature: string }> = [];
    const authorizationHashes = new Set<string>();
    // A nonce is scoped to an EOA on a chain. The same nonce on two chains
    // must not reuse the same EIP-7702 authorization signature.
    const nonceMap = new Map<string, string>();

    const signEip7702Auth = async (contractAddress: string, chainId: number, nonce?: number) => {
      return magic.wallet.sign7702Authorization({
        contractAddress,
        chainId,
        ...(nonce !== undefined ? { nonce } : {}),
      });
    };

    for (const userOp of transactionForSubmit.userOps || []) {
      const auth = userOp.eip7702Auth;

      if (auth && !userOp.eip7702Delegated) {
        const authChainId = Number(auth.chainId || userOp.chainId);
        const authNonce = Number(auth.nonce);

        if (!Number.isSafeInteger(authChainId) || authChainId <= 0) {
          throw new Error(
            "Magic cannot sign a chain-agnostic EIP-7702 authorization. Upgrade EIP-7702 on the source network first.",
          );
        }
        if (!Number.isSafeInteger(authNonce) || authNonce < 0 || !auth.address) {
          throw new Error("Particle returned an invalid EIP-7702 authorization.");
        }

        const authKey = `${authChainId}:${authNonce}:${auth.address.toLowerCase()}`;
        let serialized = nonceMap.get(authKey);

        if (!serialized) {
          // Keep Magic on the authorization chain so the wallet signs the
          // same network context Particle put in the UserOperation.
          await magic.evm.switchChain(authChainId);
          const authorization = await signEip7702Auth(
            auth.address,
            authChainId,
            authNonce,
          );

          // Particle expects the serialized 65-byte EIP-7702 signature.
          // Magic documents r/s/v as the canonical response fields; do not
          // pass a provider-specific `signature` field through unchecked.
          serialized = Signature.from({
            r: authorization.r,
            s: authorization.s,
            v: Number(authorization.v),
          }).serialized;
          nonceMap.set(authKey, serialized);
        }

        const userOpHash = String(userOp.userOpHash || "");
        if (!authorizationHashes.has(userOpHash)) {
          authorizations.push({ userOpHash, signature: serialized });
          authorizationHashes.add(userOpHash);
        }
      }
    }

    if (authorizations.some((authorization) => !authorization.userOpHash)) {
      throw new Error("Particle returned a UserOperation without a hash.");
    }

    // Match Particle's Magic demo exactly: sign the raw rootHash bytes through
    // an ethers signer. This invokes personal_sign/EIP-191 without treating
    // the hexadecimal hash as UTF-8 text.
    const provider = new BrowserProvider(magic.rpcProvider as any);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      throw new Error(
        `The Magic signer (${signerAddress}) does not match the Universal Account owner (${ownerAddress}).`,
      );
    }

    const signature = await signer.signMessage(getBytes(transactionForSubmit.rootHash));

    if (!signature || !/^0x[0-9a-fA-F]{130}$/.test(signature)) {
      throw new Error("Magic returned an invalid root signature.");
    }

    const recoveredOwner = verifyMessage(getBytes(transactionForSubmit.rootHash), signature);
    if (recoveredOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
      throw new Error(
        `The root signature does not match the owner EOA (${recoveredOwner}). Sign in to your wallet again.`,
      );
    }

    return universalAccount.sendTransaction(
      transactionForSubmit,
      signature,
      authorizations.length > 0 ? authorizations : undefined,
    );
  };
}

export function useRefreshAccount(ownerAddress?: string) {
  const queryClient = useQueryClient();

  return async () => {
    // Account refresh is deliberately background-only. Waiting for balances
    // while a quote is being retried can cause the next quote to race with a
    // snapshot refetch and make an otherwise valid UserOperation stale.
    await queryClient.invalidateQueries({
      queryKey: universalAccountQueryKeys.snapshot(ownerAddress),
      refetchType: "none",
    });
    void queryClient.refetchQueries({
      queryKey: universalAccountQueryKeys.snapshot(ownerAddress),
      type: "active",
    });
  };
}
