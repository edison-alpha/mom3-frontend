"use client";

import { loadIcons } from "@iconify/react";
import { useEffect } from "react";

const COMMON_ICON_NAMES = [
  "material-symbols:verified-rounded",
  "material-symbols:check-rounded",
  "material-symbols:history-2",
  "ic:twotone-wallet",
  "icon-park-outline:search",
  "solar:chart-square-bold",
  "solar:danger-triangle-bold",
  "solar:global-bold",
  "solar:lock-keyhole-linear",
  "solar:shield-check-bold",
  "solar:shield-check-linear",
  "solar:stars-bold",
  "solar:wallet-money-bold",
  "cryptocurrency-color:bnb",
  "cryptocurrency-color:eth",
  "cryptocurrency-color:solana",
  "cryptocurrency-color:usdc",
  "cryptocurrency-color:usdt",
  "simple-icons:aave",
  "simple-icons:ethereum",
  "simple-icons:morpho",
  "simple-icons:polygon",
  "simple-icons:uniswap",
  "simple-icons:zora",
  "token-branded:arbitrum",
  "token-branded:base",
  "token-branded:ethena",
  "token-branded:pendle",
  "token-branded:jupiter",
  "token-branded:kamino",
  "token-branded:raydium",
  "token-branded:curve",
  "token-branded:balancer",
  "token-branded:lido",
  "token-branded:defi",
];

export function IconifyPreload() {
  useEffect(() => {
    const abort = loadIcons(COMMON_ICON_NAMES);
    return abort;
  }, []);

  return null;
}
