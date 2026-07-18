export type UsernameIdentity = {
  username: string;
  owner_address: string;
  address: string | null;
  addresses: Record<string, string>;
  avatar_url?: string | null;
};

export type ClaimUsernameInput = {
  username: string;
  ownerAddress: string;
  chainId: number;
  address: string;
};
