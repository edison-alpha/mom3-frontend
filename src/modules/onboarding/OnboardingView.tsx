"use client";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { MobileShell } from "@/components/ui/mobile-shell";
import { useMagic } from "@/providers/magic/components/MagicProvider";

function FloatingShape({
  className,
}: {
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-[45%] bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.75),rgba(204,255,0,0.2)_34%,rgba(59,51,189,0.72)_70%)] shadow-[0_24px_80px_-28px_rgba(20,18,80,0.7)] blur-[1px] ${className}`}
    />
  );
}

export default function OnboardingView() {
  const router = useRouter();
  const {
    error,
    isLoading,
    isReady,
    loginWithGoogle,
    session,
  } = useMagic();

  useEffect(() => {
    if (session?.ownerAddress) {
      router.replace("/dashboard");
    }
  }, [router, session?.ownerAddress]);

  return (
    <MobileShell
      className="min-h-dvh overflow-hidden bg-[#3B33BD]"
      contentClassName="relative min-h-dvh pb-7 pt-5"
    >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#201B8F_0%,#3B33BD_42%,#6F7CFF_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(204,255,0,0.18),transparent_22%),radial-gradient(circle_at_84%_6%,rgba(126,120,234,0.78),transparent_26%),radial-gradient(circle_at_94%_48%,rgba(59,51,189,0.62),transparent_24%),radial-gradient(circle_at_10%_82%,rgba(8,7,34,0.45),transparent_18%)]" />

        <FloatingShape
          className="-left-16 top-28 h-40 w-40 rotate-12"
        />
        <FloatingShape
          className="-right-10 top-0 h-44 w-36 rotate-[22deg] opacity-80 blur-sm"
        />
        <FloatingShape
          className="-right-24 top-[43%] h-40 w-40 rotate-45 opacity-80 blur-md"
        />
        <FloatingShape
          className="-left-20 bottom-[22%] h-32 w-32 opacity-70 blur-sm"
        />

        <section className="relative z-10 mt-auto -translate-y-14 text-center">
          <p className="text-[52px] font-black leading-none tracking-normal text-white/90 drop-shadow-[0_12px_28px_rgba(26,28,92,0.18)]">
            mom3
          </p>
          <h1 className="mx-auto mt-16 max-w-[280px] text-2xl font-black leading-tight tracking-normal text-white drop-shadow-[0_8px_24px_rgba(25,25,80,0.18)]">
            Start managing assets in an instant.
          </h1>
        </section>

        <section className="relative z-10 mt-7 -translate-y-14 space-y-3">
          <Button
            type="button"
            isDisabled
            label="Apple sign-in unavailable"
            startIcon="simple-icons:apple"
            rounded="lg"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-[18px] bg-white text-base font-black text-black shadow-[0_16px_42px_-24px_rgba(14,18,58,0.7)] transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white"
          />

          <Button
            type="button"
            onClick={() => {
              void loginWithGoogle();
            }}
            isDisabled={!isReady}
            isLoading={isLoading}
            label={isLoading ? "Connecting wallet" : "Sign in with Google"}
            startIcon="flat-color-icons:google"
            rounded="lg"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-[18px] border border-white/12 bg-[#12111A] text-base font-black text-white shadow-[0_16px_42px_-24px_rgba(14,18,58,0.8)] transition-transform hover:bg-[#191824] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-70"
          />

          {error ? (
            <p role="alert" className="rounded-2xl bg-black/25 px-4 py-3 text-sm font-semibold text-white">
              {error}
            </p>
          ) : null}
        </section>

        <p className="relative z-10 mx-auto mt-6 max-w-xs -translate-y-14 text-center text-xs font-semibold leading-snug text-white/70">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
    </MobileShell>
  );
}
