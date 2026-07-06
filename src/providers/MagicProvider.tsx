"use client";

import { EVMExtension } from "@magic-ext/evm";
import { OAuthExtension } from "@magic-ext/oauth2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Magic as MagicBase } from "magic-sdk";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  clearWalletSession,
  getWalletSession,
  saveWalletSession,
  type Mom3AuthProvider,
  type Mom3WalletSession,
} from "@/lib/wallet-session";

export type Mom3Magic = MagicBase<[OAuthExtension, EVMExtension]>;

type MagicContextType = {
  magic: Mom3Magic | null;
  session: Mom3WalletSession | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  completeRedirectLogin: () => Promise<Mom3WalletSession | null>;
  logout: () => Promise<void>;
};

const MagicContext = createContext<MagicContextType | null>(null);

export const magicQueryKeys = {
  instance: ["magic", "instance"] as const,
  session: ["magic", "session"] as const,
};

const DEFAULT_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_PARTICLE_7702_CHAIN_ID ||
    process.env.NEXT_PUBLIC_MAGIC_CHAIN_ID ||
    process.env.NEXT_PUBLIC_BASE_CHAIN_ID ||
    42161,
);

const MAGIC_CHAIN_CONFIGS = [
  {
    chainId: 42161,
    rpcUrl: process.env.NEXT_PUBLIC_ARB_RPC_URL || "https://arb1.arbitrum.io/rpc",
  },
  {
    chainId: 8453,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
  },
  {
    chainId: 10,
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  },
  {
    chainId: 137,
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
  },
  {
    chainId: 56,
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed.binance.org",
  },
].map((chain) => ({
  ...chain,
  default: chain.chainId === DEFAULT_CHAIN_ID,
}));

if (!MAGIC_CHAIN_CONFIGS.some((chain) => chain.default)) {
  MAGIC_CHAIN_CONFIGS[0] = {
    ...MAGIC_CHAIN_CONFIGS[0],
    default: true,
  };
}

function createMagicInstance() {
  const apiKey = process.env.NEXT_PUBLIC_MAGIC_API_KEY;

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_MAGIC_API_KEY belum diisi.");
  }

  return new MagicBase(apiKey, {
    extensions: [
      new OAuthExtension(),
      new EVMExtension(MAGIC_CHAIN_CONFIGS),
    ],
  }) as Mom3Magic;
}

function getPublicAddress(metadata: Awaited<ReturnType<Mom3Magic["user"]["getInfo"]>>) {
  const metadataWithLegacyAddress = metadata as typeof metadata & {
    publicAddress?: string;
  };

  return (
    metadata?.wallets?.ethereum?.publicAddress ||
    metadataWithLegacyAddress.publicAddress ||
    ""
  );
}

async function persistCurrentUser(
  magic: Mom3Magic,
  token: string,
  provider: Mom3AuthProvider,
) {
  const metadata = await magic.user.getInfo();
  const ownerAddress = getPublicAddress(metadata);

  if (!ownerAddress) {
    throw new Error("Magic login berhasil, tapi EOA address tidak ditemukan.");
  }

  const nextSession: Mom3WalletSession = {
    token,
    ownerAddress,
    email: metadata.email ?? undefined,
    issuer: metadata.issuer ?? undefined,
    provider,
  };

  saveWalletSession(nextSession);
  return nextSession;
}

export function MagicProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const magicQuery = useQuery({
    queryKey: magicQueryKeys.instance,
    queryFn: createMagicInstance,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const sessionQuery = useQuery({
    queryKey: magicQueryKeys.session,
    queryFn: getWalletSession,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const loginWithGoogleMutation = useMutation({
    mutationFn: async () => {
      if (!magicQuery.data) throw new Error("Magic belum siap.");

      await magicQuery.data.oauth2.loginWithRedirect({
        provider: "google",
        redirectURI: `${window.location.origin}/auth`,
      });
    },
  });

  const completeRedirectLoginMutation = useMutation({
    mutationFn: async () => {
      if (!magicQuery.data) return null;

      const result = await magicQuery.data.oauth2.getRedirectResult();
      const token =
        result?.magic?.idToken ||
        (await magicQuery.data.user.getIdToken({ lifespan: 60 * 60 * 24 * 7 }));
      return persistCurrentUser(magicQuery.data, token, "google");
    },
    onSuccess: (nextSession) => {
      queryClient.setQueryData(magicQueryKeys.session, nextSession);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (magicQuery.data && (await magicQuery.data.user.isLoggedIn())) {
        await magicQuery.data.user.logout();
      }

      clearWalletSession();
    },
    onSuccess: () => {
      queryClient.setQueryData(magicQueryKeys.session, null);
      void queryClient.invalidateQueries({ queryKey: ["universal-account"] });
    },
  });

  const value = useMemo(
    () => ({
      magic: magicQuery.data ?? null,
      session: sessionQuery.data ?? null,
      isReady: Boolean(magicQuery.data),
      isLoading:
        magicQuery.isLoading ||
        sessionQuery.isLoading ||
        loginWithGoogleMutation.isPending ||
        completeRedirectLoginMutation.isPending ||
        logoutMutation.isPending,
      error:
        magicQuery.error?.message ||
        sessionQuery.error?.message ||
        loginWithGoogleMutation.error?.message ||
        completeRedirectLoginMutation.error?.message ||
        logoutMutation.error?.message ||
        null,
      loginWithGoogle: loginWithGoogleMutation.mutateAsync,
      completeRedirectLogin: completeRedirectLoginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
    }),
    [
      magicQuery.data,
      magicQuery.error?.message,
      magicQuery.isLoading,
      sessionQuery.data,
      sessionQuery.error?.message,
      sessionQuery.isLoading,
      loginWithGoogleMutation.isPending,
      loginWithGoogleMutation.error?.message,
      loginWithGoogleMutation.mutateAsync,
      completeRedirectLoginMutation.isPending,
      completeRedirectLoginMutation.error?.message,
      completeRedirectLoginMutation.mutateAsync,
      logoutMutation.isPending,
      logoutMutation.error?.message,
      logoutMutation.mutateAsync,
    ],
  );

  return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>;
}

export function useMagic() {
  const context = useContext(MagicContext);

  if (!context) {
    throw new Error("useMagic must be used within MagicProvider");
  }

  return context;
}
