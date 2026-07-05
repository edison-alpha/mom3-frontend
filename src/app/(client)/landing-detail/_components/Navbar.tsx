"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // At the very top, always show.
      if (window.scrollY <= 8) {
        setVisible(true);
        if (idleTimer.current) {
          clearTimeout(idleTimer.current);
          idleTimer.current = null;
        }
        return;
      }

      // Actively scrolling -> hide.
      setVisible(false);

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setVisible(true);
      }, 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-transparent transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="px-4 pt-2 md:px-8 md:pt-3">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/brand-logo.png"
              alt="mom3"
              width={64}
              height={64}
              className="h-14 w-14 object-contain brightness-0 md:h-16 md:w-16"
              priority
            />
          </div>

          <Link
            href="/onboarding"
            className="flex items-center gap-0.5 rounded-full border border-white/25 bg-white/10 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
          >
            <span className="relative flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold text-[#0A0A0A] transition-colors hover:bg-white/20 md:px-5 md:py-2.5 md:text-base">
              /Earn
            </span>
            <span className="relative flex items-center justify-center rounded-full bg-[#0A0A0A] px-4 py-2 text-sm font-bold text-[#ccff00] shadow-[inset_0_-3px_6px_0_rgba(255,255,255,0.18),inset_0_3px_6px_0_rgba(0,0,0,0.4),0_2px_6px_0_rgba(0,0,0,0.25)] md:px-5 md:py-2.5 md:text-base">
              Start
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
