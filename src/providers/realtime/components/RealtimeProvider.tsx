"use client";

import * as React from "react";

import { useUniversalAccount } from "@/providers/universal-account/components/UniversalAccountProvider";
import type {
  RealtimeContextType,
  RealtimeMarketSnapshot,
  RealtimeStatus,
} from "@/providers/realtime/types/realtime.types";

const RealtimeContext = React.createContext<RealtimeContextType | null>(null);
const BALANCE_REFRESH_THROTTLE_MS = 4_000;
const MAX_RECONNECT_MS = 30_000;

function realtimeUrl() {
  const configured = process.env.NEXT_PUBLIC_MOM3_REALTIME_URL;
  const backend = process.env.NEXT_PUBLIC_MOM3_BACKEND_URL;
  const candidate = configured || backend;

  if (!candidate) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.hostname}:4000/realtime`;
  }

  try {
    const url = new URL(candidate);
    if (url.hostname === "localhost" && window.location.hostname !== "localhost") {
      url.hostname = window.location.hostname;
    }
    url.protocol = url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:";
    url.pathname = configured ? url.pathname : "/realtime";
    return url.toString();
  } catch {
    return candidate;
  }
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { accountInfo, refreshAccount } = useUniversalAccount();
  const account = accountInfo.evmSmartAccount;
  const [status, setStatus] = React.useState<RealtimeStatus>("connecting");
  const [marketRevision, setMarketRevision] = React.useState("");
  const [marketSnapshot, setMarketSnapshot] = React.useState<RealtimeMarketSnapshot | null>(null);
  const [lastBalanceEventAt, setLastBalanceEventAt] = React.useState<string | null>(null);
  const lastBalanceRefreshRef = React.useRef(0);
  const refreshAccountRef = React.useRef(refreshAccount);

  React.useEffect(() => {
    refreshAccountRef.current = refreshAccount;
  }, [refreshAccount]);

  React.useEffect(() => {
    if (typeof WebSocket === "undefined") {
      setStatus("disabled");
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let disposed = false;
    let reconnectAttempts = 0;

    const connect = () => {
      if (disposed) return;
      setStatus(reconnectAttempts > 0 ? "reconnecting" : "connecting");
      socket = new WebSocket(realtimeUrl());

      socket.addEventListener("open", () => {
        reconnectAttempts = 0;
        setStatus("connected");
        socket?.send(JSON.stringify({
          type: "subscribe",
          topics: account ? ["balance", "markets"] : ["markets"],
          account,
          chainIds: [42161, 8453],
        }));
      });

      socket.addEventListener("message", (event) => {
        let message: Record<string, unknown>;
        try {
          message = JSON.parse(String(event.data)) as Record<string, unknown>;
        } catch {
          return;
        }

        if (message.type === "market.updated") {
          setMarketRevision(String(message.revision || message.timestamp || Date.now()));
          setMarketSnapshot((message.data as RealtimeMarketSnapshot | undefined) ?? null);
          return;
        }

        if (message.type === "balance.invalidate" && account) {
          const timestamp = String(message.timestamp || new Date().toISOString());
          setLastBalanceEventAt(timestamp);
          const now = Date.now();
          if (
            document.visibilityState === "visible"
            && now - lastBalanceRefreshRef.current >= BALANCE_REFRESH_THROTTLE_MS
          ) {
            lastBalanceRefreshRef.current = now;
            void refreshAccountRef.current();
          }
        }
      });

      socket.addEventListener("close", () => {
        if (disposed) return;
        reconnectAttempts += 1;
        setStatus("reconnecting");
        const delay = Math.min(MAX_RECONNECT_MS, 1_000 * 2 ** Math.min(reconnectAttempts, 5));
        reconnectTimer = window.setTimeout(connect, delay);
      });

      socket.addEventListener("error", () => socket?.close());
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [account]);

  const value = React.useMemo(
    () => ({ status, marketRevision, marketSnapshot, lastBalanceEventAt }),
    [lastBalanceEventAt, marketRevision, marketSnapshot, status],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const context = React.useContext(RealtimeContext);
  if (!context) throw new Error("useRealtime must be used within RealtimeProvider");
  return context;
}
