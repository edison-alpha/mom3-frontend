"use client";

import * as React from "react";
import { Download, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = React.useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(true);
  const [dismissed, setDismissed] = React.useState(false);
  const [showInstructions, setShowInstructions] = React.useState(false);

  React.useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsStandalone(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (isStandalone || dismissed) return null;

  const install = async () => {
    if (!installEvent) {
      setShowInstructions(true);
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setIsStandalone(true);
    setInstallEvent(null);
  };

  return (
    <aside className="sticky top-0 z-[100] flex min-h-14 items-center justify-between gap-3 bg-[#111217] px-4 py-2.5 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.9)]" aria-label="Install mom3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Download className="h-4 w-4 shrink-0 text-[#ccff00]" aria-hidden="true" />
        <p className="truncate text-xs font-medium text-white">Add mom3 to your home screen</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => void install()} className="min-h-10 rounded-full bg-[#ccff00] px-4 text-xs font-semibold text-black transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00]">
          Add to home screen
        </button>
        <button type="button" onClick={() => setDismissed(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#ccff00]" aria-label="Dismiss install banner">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {showInstructions ? <p className="absolute left-4 right-4 top-full rounded-b-2xl bg-[#1C1C1E] px-4 py-3 text-xs font-semibold text-white shadow-lg">Open your browser menu, then choose “Add to Home Screen” or “Install app”.</p> : null}
    </aside>
  );
}
