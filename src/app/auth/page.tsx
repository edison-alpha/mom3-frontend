import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import AuthCallbackView from "@/modules/auth/AuthCallbackView";

export const metadata: Metadata = {
  title: "Auth | mom3",
  description: "Completing your mom3 sign in.",
};

export const viewport: Viewport = {
  themeColor: "#6C7CFF",
  width: "device-width",
  initialScale: 1,
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1700D6]" />}>
      <AuthCallbackView />
    </Suspense>
  );
}
