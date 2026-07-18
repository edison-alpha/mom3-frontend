export type Recipient = {
  id: string;
  handle: string;
  name: string;
  address: string;
  network: string;
  status: "Friend" | "Recent" | "Verified" | "External";
  color: string;
  avatarUrl?: string | null;
};

export type TokenRow = {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  amountInUSD: number;
  icon: string;
  chainName: string;
  chainId: number;
  tokenAddress: string;
  isSuggested?: boolean;
};

export type SendStatus = "idle" | "delegating" | "preparing" | "signing";

export type SendPreview = {
  transaction: ITransaction;
  amount: string;
  token: TokenRow;
  recipient: Recipient;
};

import type { ITransaction } from "@particle-network/universal-account-sdk";
