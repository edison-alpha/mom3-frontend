import type { Metadata, Viewport } from "next";
import "./globals.css";
import { IconifyPreload } from "@/components/ui/iconify-preload";
import { ServiceWorkerRegister } from "@/providers/service-worker/ServiceWorkerRegister";
import { WalletProviders } from "@/providers/WalletProviders";

export const metadata: Metadata = {
  applicationName: "mom3",
  title: {
    default: "mom3",
    template: "%s | mom3",
  },
  description:
    "Discover yield opportunities and let AI optimize your portfolio with mom3.",
  manifest: "/manifest.json?v=3",
  appleWebApp: {
    capable: true,
    title: "mom3",
    statusBarStyle: "default",
    startupImage: "/apple-touch-icon.png",
  },
  icons: {
    icon: "/icon-192x192.png?v=3",
    apple: "/apple-touch-icon.png?v=3",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-rounded antialiased">
        <IconifyPreload />
        <WalletProviders>{children}</WalletProviders>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
