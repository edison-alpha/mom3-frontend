import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import HistoryView from "@/modules/history/HistoryView";

export const metadata: Metadata = {
  title: "History | Oni",
  description: "View your personal, friends, and global activity history.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HistoryView />
    </Suspense>
  );
}
