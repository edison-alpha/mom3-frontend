"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as React from "react";

import { formatUsd } from "@/lib/format";
import { chainNameFromId } from "@/lib/chain";
import { truncateAddress } from "@/utils/address.utils";
import { useMagic } from "@/providers/magic/components/MagicProvider";
import { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";
import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import type {
  ProfileIdentityRow,
  UniversalAccountRow,
} from "@/modules/profile/types/profile.types";
import { getMyUsername } from "@/modules/username/utils/username.api";
import { getUserProfile, uploadProfileAvatar } from "../utils/profile.api";

function nativeGasToken(chainId: number) {
  if (chainId === 56) return "BNB";
  if (chainId === 196) return "OKB";
  if (chainId === 146) return "S";
  if (chainId === 43114) return "AVAX";
  return "ETH";
}

function isUserRejected(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /user rejected|user denied|request rejected|cancelled|canceled/i.test(message);
}

function delegationErrorMessage(error: unknown, chainId: number) {
  const message = error instanceof Error ? error.message : String(error || "");
  const chain = chainNameFromId(chainId);

  if (/insufficient funds|have 0 want/i.test(message)) {
    return `Add a small amount of ${nativeGasToken(chainId)} to the owner wallet on ${chain} to pay EIP-7702 delegation gas, then try again.`;
  }

  if (/does not provide an EIP-7702 deployment|did not return EIP-7702 authorization|not supported by universal account version/i.test(message)) {
    return `${chain} is available in Particle, but EIP-7702 delegation is not deployed for this chain in the current Particle account configuration.`;
  }

  return `EIP-7702 could not be enabled on ${chain}. Check your network and try again.`;
}

export function useProfileViewModel() {
  const router = useRouter();
  const { isLoading: isMagicLoading, logout: magicLogout, session } = useMagic();
  const {
    accountInfo,
    eip7702Deployments,
    ensureDelegated,
    error: universalAccountError,
    isDelegated,
    isLoading: isUniversalAccountLoading,
    primaryAssets,
    refreshAccount,
    universalAccount,
  } = useUniversalAccount();
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);
  const [universalAccountOpen, setUniversalAccountOpen] = React.useState(false);
  const [eip7702Open, setEip7702Open] = React.useState(false);
  const [delegatingChainId, setDelegatingChainId] = React.useState<number | null>(null);
  const [delegationError, setDelegationError] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile", session?.ownerAddress || null],
    queryFn: () => getUserProfile(session?.ownerAddress as string),
    enabled: Boolean(session?.ownerAddress),
    staleTime: 300_000,
  });
  const avatarMutation = useMutation({
    mutationKey: ["profile", "avatar"],
    mutationFn: uploadProfileAvatar,
    onSuccess: (profile) => queryClient.setQueryData(["profile", session?.ownerAddress || null], profile),
  });

  useEffect(() => {
    if (!isMagicLoading && !session?.ownerAddress) {
      router.replace("/login");
    }
  }, [isMagicLoading, router, session?.ownerAddress]);

  useEffect(() => {
    if (!session?.ownerAddress) return;
    void getMyUsername(session.ownerAddress).then((identity) => setUsername(identity?.username || null)).catch(() => setUsername(null));
  }, [session?.ownerAddress]);

  const delegateMutation = useMutation({
    mutationFn: async (chainId: number) => {
      await ensureDelegated(chainId);
      await refreshAccount();
    },
  });

  const delegateOnChain = async (chainId: number) => {
    setDelegatingChainId(chainId);
    setDelegationError(null);
    try {
      await delegateMutation.mutateAsync(chainId);
    } catch (error) {
      if (!isUserRejected(error)) {
        setDelegationError(delegationErrorMessage(error, chainId));
      }
      delegateMutation.reset();
    } finally {
      setDelegatingChainId(null);
    }
  };

  const handleEip7702OpenChange = (open: boolean) => {
    if (open) {
      setDelegationError(null);
      setEip7702Open(true);
      return;
    }

    setEip7702Open(false);
    setDelegationError(null);
    delegateMutation.reset();
  };

  const totalUsd =
    primaryAssets && "totalAmountInUSD" in primaryAssets
      ? Number(primaryAssets.totalAmountInUSD || 0)
      : 0;

  const ownerAddress = accountInfo.ownerAddress || session?.ownerAddress || "";
  const isAnyChainDelegated = eip7702Deployments.some((deployment) => deployment.isDelegated);
  const isDefaultChainDelegated = eip7702Deployments.some(
    (deployment) => deployment.chainId === DEFAULT_CHAIN_ID && deployment.isDelegated,
  );

  const identityRows: ProfileIdentityRow[] = [
    {
      icon: "solar:wallet-money-bold",
      label: "Universal Balance",
      value: isUniversalAccountLoading ? "Loading" : formatUsd(totalUsd),
    },
    {
      icon: "solar:shield-check-bold",
      label: "EIP-7702",
      value: isAnyChainDelegated ? "Delegated" : "Ready to upgrade",
    },
    {
      icon: "solar:global-bold",
      label: "Owner EOA",
      value: truncateAddress(session?.ownerAddress || ""),
    },
  ];

  const universalAccountRows: UniversalAccountRow[] = [
    {
      icon: "solar:user-id-bold",
      label: "Owner EOA",
      description: "Magic signer",
      address: ownerAddress,
    },
    {
      icon: "solar:global-bold",
      label: "EVM account",
      description: "Universal EVM smart account",
      address: accountInfo.evmSmartAccount,
    },
    {
      icon: "token-branded:solana",
      label: "Solana account",
      description: "Universal Solana address",
      address: accountInfo.solanaSmartAccount,
    },
  ];

  const logout = async () => {
    await magicLogout();
    router.replace("/login");
  };

  const copyAddress = async (address: string, label: string) => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopiedAddress(label);
    window.setTimeout(() => setCopiedAddress(null), 1200);
  };

  const uploadAvatar = async (file: File) => {
    if (!ownerAddress) throw new Error("Connect your wallet first.");
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Profile image must be smaller than 5 MB.");
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Unable to read profile image."));
      reader.readAsDataURL(file);
    });
    return avatarMutation.mutateAsync({ ownerAddress, data, contentType: file.type, fileName: file.name });
  };

  const openUniversalAccountSheet = () => setUniversalAccountOpen(true);

  return {
    copiedAddress,
    delegateErrorMessage: delegationError,
    delegatedChainIds: eip7702Deployments
      .filter((deployment) => deployment.isDelegated)
      .map((deployment) => deployment.chainId),
    delegatingChainId,
    eip7702Deployments,
    eip7702Open,
    identityRows,
    isAuthenticated: Boolean(session?.ownerAddress),
    isUniversalAccountLoading,
    isDelegated,
    isUpgradeDisabled:
      isMagicLoading ||
      !universalAccount ||
      isDefaultChainDelegated ||
      delegateMutation.isPending,
    isUpgradePending: delegateMutation.isPending,
    logout,
    onDelegate: (chainId: number) => {
      void delegateOnChain(chainId);
    },
    onOpenEip7702: () => handleEip7702OpenChange(true),
    onUpgrade: () => {
      void delegateOnChain(DEFAULT_CHAIN_ID);
    },
    openUniversalAccountSheet,
    ownerAddress,
    profileEmail: session?.email || null,
    username,
    avatarUrl: profileQuery.data?.avatar_url || null,
    isAvatarUploading: avatarMutation.isPending,
    uploadAvatar,
    setUniversalAccountOpen,
    onEip7702OpenChange: handleEip7702OpenChange,
    universalAccountError,
    universalAccountOpen,
    universalAccountRows,
    copyAddress,
  };
}
