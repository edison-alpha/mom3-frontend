import type { Metadata, Viewport } from "next";

import OnboardingView from "../onboarding/OnboardingView";

export const metadata: Metadata = {
  title: "Login | mom3",
  description: "Sign in to mom3.",
};

export const viewport: Viewport = {
  themeColor: "#6C7CFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function LoginPage() {
  return <OnboardingView />;
}
