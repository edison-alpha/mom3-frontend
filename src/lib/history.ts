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
  tokenSymbol?: string;
};

export const historyTabs: { id: HistoryTab; label: string }[] = [
  { id: "me", label: "Me" },
  { id: "friends", label: "Friends" },
  { id: "global", label: "Global" },
];

export const historyItems: Record<HistoryTab, HistoryItem[]> = {
  me: [
    {
      id: "me-1",
      tab: "me",
      title: "Deposit received",
      description: "Universal Balance",
      amount: "+$120.00",
      time: "2m ago",
      status: "Completed",
      network: "Base",
      reference: "0x7a91...e24c",
      note: "Funds are available in your universal balance.",
      icon: "solar:wallet-money-bold",
      tone: "green",
    },
    {
      id: "me-2",
      tab: "me",
      title: "Yield earned",
      description: "mom3 rewards",
      amount: "+12.4 MOM",
      time: "1h ago",
      status: "Completed",
      network: "mom3 rewards",
      reference: "reward-2407",
      note: "Your yield position generated a new rewards payout.",
      icon: "solar:leaf-bold",
      tone: "purple",
    },
    {
      id: "me-3",
      tab: "me",
      title: "Sent to @raka",
      description: "Base network",
      amount: "-$24.50",
      time: "Yesterday",
      status: "Completed",
      network: "Base",
      reference: "0x4f3h...8a7d",
      note: "Transfer confirmed and visible to the recipient.",
      icon: "solar:plain-bold",
      tone: "blue",
    },
  ],
  friends: [
    {
      id: "friends-1",
      tab: "friends",
      title: "@naya claimed username",
      description: "Now active on mom3",
      amount: "New",
      time: "8m ago",
      status: "Live",
      network: "mom3 identity",
      reference: "@naya",
      note: "Your friend now has a public mom3 profile.",
      icon: "material-symbols:verified-rounded",
      tone: "green",
    },
    {
      id: "friends-2",
      tab: "friends",
      title: "@raka sent assets",
      description: "Transfer to @dimas",
      amount: "$42.00",
      time: "32m ago",
      status: "Completed",
      network: "Base",
      reference: "0x87b1...4d10",
      note: "Friend activity is shown when it is shared with your circle.",
      icon: "solar:transfer-horizontal-bold",
      tone: "blue",
    },
    {
      id: "friends-3",
      tab: "friends",
      title: "@salsa earned rewards",
      description: "Yield position updated",
      amount: "+8.1 MOM",
      time: "3h ago",
      status: "Completed",
      network: "mom3 rewards",
      reference: "reward-2406",
      note: "A friend in your circle earned rewards from their position.",
      icon: "solar:stars-bold",
      tone: "purple",
    },
  ],
  global: [
    {
      id: "global-1",
      tab: "global",
      title: "1,204 new handles",
      description: "Claimed across the network",
      amount: "Live",
      time: "Today",
      status: "Live",
      network: "mom3 identity",
      reference: "handles-24h",
      note: "Global handle claims are trending up across the network.",
      icon: "solar:global-bold",
      tone: "green",
    },
    {
      id: "global-2",
      tab: "global",
      title: "Top reward pool",
      description: "Collectibles season",
      amount: "$8.4k",
      time: "Today",
      status: "Open",
      network: "mom3 rewards",
      reference: "pool-season-1",
      note: "The leading reward pool is attracting the most activity today.",
      icon: "solar:cup-star-bold",
      tone: "purple",
    },
    {
      id: "global-3",
      tab: "global",
      title: "Network transfers",
      description: "24h mom3 activity",
      amount: "18.2k",
      time: "24h",
      status: "Live",
      network: "Base",
      reference: "network-24h",
      note: "Aggregate transfer count across public mom3 activity.",
      icon: "solar:graph-up-bold",
      tone: "blue",
    },
  ],
};

export const allHistoryItems = Object.values(historyItems).flat();

export function getHistoryItemById(id: string) {
  return allHistoryItems.find((item) => item.id === id);
}
