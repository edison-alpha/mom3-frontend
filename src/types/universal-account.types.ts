"use client";

import type {
  IAssetsResponse,
  ITransaction,
  UniversalAccount,
} from "@particle-network/universal-account-sdk";
import type { ReactNode } from "react";

export type AccountInfo = {
  ownerAddress: string;
  evmSmartAccount: string;
  solanaSmartAccount: string;
};

export type Eip7702Deployment = {
  chainId: number;
  delegationAddress: string;
  isDelegated: boolean;
};

export type UniversalAccountSnapshot = {
  accountInfo: AccountInfo;
  isDelegated: boolean;
  eip7702Deployments: Eip7702Deployment[];
  primaryAssets: IAssetsResponse | null;
};

export type SignAndSendTransaction = (
  transaction: ITransaction,
) => Promise<{ transactionId: string }>;

export type UniversalAccountContextType = {
  universalAccount: UniversalAccount | null;
  accountInfo: AccountInfo;
  eip7702Deployments: Eip7702Deployment[];
  primaryAssets: IAssetsResponse | null;
  isDelegated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshAccount: () => Promise<void>;
  ensureDelegated: (chainId?: number) => Promise<boolean>;
  signAndSend: SignAndSendTransaction;
};

export type UniversalAccountProviderProps = {
  children: ReactNode;
};
