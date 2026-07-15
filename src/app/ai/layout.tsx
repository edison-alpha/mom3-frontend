import { SelectedChainProvider } from "@/modules/ai/hooks/useSelectedChain";

/**
 * Wraps the AI subtree (/ai chat + /ai/strategy) in the selected-chain context
 * so the user's chain selection is shared across both views.
 */
export default function AiLayout({ children }: { children: React.ReactNode }) {
  return <SelectedChainProvider>{children}</SelectedChainProvider>;
}
