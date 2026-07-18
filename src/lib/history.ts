export type HistoryTab = "me" | "friends" | "global";

export type HistoryItem = {
  id: string;
  tab: HistoryTab;
  title: string;
  description: string;
  amount: string;
  time: string;
  status: string;
  network: string;
  reference: string;
  note: string;
  icon: string;
  tone: "green" | "purple" | "blue";
  transactionHash?: string | null;
  explorerUrl?: string | null;
  tokenSymbol?: string;
};

export const historyTabs: { id: HistoryTab; label: string }[] = [
  { id: "me", label: "Me" },
  { id: "friends", label: "Friends" },
  { id: "global", label: "Global" },
];

// History is loaded from the wallet/Backend at runtime. No static activity is
// included so a new installation never presents fabricated transactions.
export const allHistoryItems: HistoryItem[] = [];

export function getHistoryItemById(_id: string): HistoryItem | undefined {
  return undefined;
}
