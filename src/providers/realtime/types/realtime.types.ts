export type RealtimeStatus = "disabled" | "connecting" | "connected" | "reconnecting";

export type RealtimeMarketSnapshot = {
  timestamp?: string | null;
  chain_id?: number | null;
  markets?: Array<Record<string, unknown>>;
};

export type RealtimeContextType = {
  status: RealtimeStatus;
  marketRevision: string;
  marketSnapshot: RealtimeMarketSnapshot | null;
  lastBalanceEventAt: string | null;
};
