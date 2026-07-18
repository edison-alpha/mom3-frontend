import { CHAIN_ID } from "@particle-network/universal-account-sdk";

import type { TokenRow } from "@/modules/send/types/send.types";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const receiveTokenTemplates: Array<
  Omit<TokenRow, "id" | "balance" | "amountInUSD">
> = [
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "cryptocurrency-color:usdc",
    chainName: "Base",
    chainId: CHAIN_ID.BASE_MAINNET,
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    isSuggested: true,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "cryptocurrency-color:usdc",
    chainName: "Solana",
    chainId: CHAIN_ID.SOLANA_MAINNET,
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    isSuggested: true,
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "cryptocurrency-color:solana",
    chainName: "Solana",
    chainId: CHAIN_ID.SOLANA_MAINNET,
    tokenAddress: ZERO_ADDRESS,
    isSuggested: true,
  },
];
