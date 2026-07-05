"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import * as React from "react";

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
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#6C7CFF] font-sans text-white antialiased">
      <div className="relative mx-auto flex min-h-screen w-full flex-col px-5 pb-7 pt-5 sm:max-w-md">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#5870F5_0%,#7B86FF_48%,#A8AEFF_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(204,255,0,0.24),transparent_21%),radial-gradient(circle_at_82%_4%,rgba(255,230,174,0.7),transparent_24%),radial-gradient(circle_at_94%_45%,rgba(255,255,255,0.32),transparent_20%),radial-gradient(circle_at_10%_80%,rgba(22,18,35,0.34),transparent_17%)]" />

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

        <header className="relative z-10 flex items-center text-white">
          <span className="sr-only">Current time</span>
          <span className="text-base font-black tracking-wide">{time || "--:--"}</span>
        </header>

        <section className="relative z-10 mt-auto text-center">
          <p className="text-[52px] font-black leading-none tracking-normal text-white/90 drop-shadow-[0_12px_28px_rgba(26,28,92,0.18)]">
            mom3
          </p>
          <h1 className="mx-auto mt-16 max-w-[280px] text-2xl font-black leading-tight tracking-normal text-white drop-shadow-[0_8px_24px_rgba(25,25,80,0.18)]">
            Start managing assets in an instant.
          </h1>
        </section>

        <section className="relative z-10 mt-7 space-y-3">
          <Link
            href="/claim-username"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-white text-base font-black text-black shadow-[0_16px_42px_-24px_rgba(14,18,58,0.7)] transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white"
          >
            <Icon icon="simple-icons:apple" className="h-5 w-5" aria-hidden="true" />
            Sign in with Apple
          </Link>

          <Link
            href="/claim-username"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-[#12111A] text-base font-black text-white shadow-[0_16px_42px_-24px_rgba(14,18,58,0.8)] transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white"
          >
            <Icon icon="flat-color-icons:google" className="h-5 w-5" aria-hidden="true" />
            Sign in with Google
          </Link>
        </section>

        <p className="relative z-10 mx-auto mt-6 max-w-xs text-center text-xs font-semibold leading-snug text-white/70">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
