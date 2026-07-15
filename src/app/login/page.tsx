import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import OnboardingView from "@/modules/onboarding/OnboardingView";

export const metadata: Metadata = {
  title: "Login | mom3",
  description: "Sign in to mom3.",
};

export const viewport: Viewport = {
  themeColor: "#6C7CFF",
  width: "device-width",
  initialScale: 1,
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1700D6]" />}>
      <OnboardingView />
    </Suspense>
  );
}
