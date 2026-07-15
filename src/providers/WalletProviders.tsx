"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { MagicProvider } from "@/providers/magic/components/MagicProvider";
import { RealtimeProvider } from "@/providers/realtime/components/RealtimeProvider";
import { UniversalAccountProvider } from "@/providers/universal-account/components/UniversalAccountProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function WalletProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MagicProvider>
        <UniversalAccountProvider>
          <RealtimeProvider>{children}</RealtimeProvider>
        </UniversalAccountProvider>
      </MagicProvider>
    </QueryClientProvider>
  );
}
