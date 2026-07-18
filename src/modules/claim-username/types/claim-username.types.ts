export type UsernameIdentity = {
  username: string;
  owner_address: string;
  address: string | null;
  addresses: Record<string, string>;
};

export type ClaimUsernameInput = {
  username: string;
  ownerAddress: string;
  chainId: number;
  address: string;
};
