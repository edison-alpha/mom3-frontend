"use client";

import * as React from "react";

import { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";

type SelectedChainContextValue = {
  chainId: number;
  setChainId: (id: number) => void;
};

const SelectedChainContext = React.createContext<SelectedChainContextValue>({
  chainId: DEFAULT_CHAIN_ID,
  setChainId: () => {},
});

export function SelectedChainProvider({ children }: { children: React.ReactNode }) {
  const [chainId, setChainId] = React.useState<number>(DEFAULT_CHAIN_ID);
  const value = React.useMemo(() => ({ chainId, setChainId }), [chainId]);

  return React.createElement(SelectedChainContext.Provider, { value }, children);
}

export function useSelectedChain() {
  return React.useContext(SelectedChainContext);
}
