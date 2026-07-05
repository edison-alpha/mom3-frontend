import type { Metadata, Viewport } from "next";

import OnboardingView from "./OnboardingView";

export const metadata: Metadata = {
  title: "Welcome to mom3",
  description: "Sign in and start managing your mom3 assets.",
};

export const viewport: Viewport = {
  themeColor: "#6C7CFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function OnboardingPage() {
  return <OnboardingView />;
}
