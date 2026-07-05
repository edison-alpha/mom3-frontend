"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";
import PhoneMock from "./PhoneMock";
import { PrimarySwipeButton } from "@/components/ui/swipper-button";
import { getLenis } from "@/components/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

type Panel = {
  label: string;
  heading: string[];
  subtitle?: string;
  body: string;
  cta: string;
};

const PANELS: Panel[] = [
  {
    label: "Assets",
    heading: ["Know every asset,", "in one place."],
    subtitle: "Your balances, positions, and activity stay easy to scan.",
    body: "Track tokens, chains, and position health without jumping between apps.",
    cta: "Start Now",
  },
  {
    label: "Markets",
    heading: ["Find lending,", "without noise."],
    subtitle: "Compare yield, borrow rates, and risk before moving funds.",
    body: "mom3 surfaces stable lending markets and explains what makes each position worth reviewing.",
    cta: "Explore Markets",
  },
  {
    label: "Rebalance",
    heading: ["Let AI suggest,", "you stay in control."],
    subtitle: "Get clear strategy suggestions before you execute.",
    body: "Review APY, risk, fees, health score, and execution route in one simple flow.",
    cta: "Start Earning",
  },
];

export default function FindFavesSection() {
  const triggerRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const phoneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const pin = pinRef.current;
    if (!trigger || !pin) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Animated experience — only when motion is allowed.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
        const phones = phoneRefs.current.filter(Boolean) as HTMLDivElement[];
        const last = panels.length - 1;

        // Initial state: first panel visible, the rest hidden (fade only).
        gsap.set(panels[0], { autoAlpha: 1 });
        gsap.set(panels.slice(1), { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            // One "screen" of scroll distance per transition between panels.
            end: () => "+=" + window.innerHeight * last,
            pin,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: panels.map((_, i) => i / last),
              duration: { min: 0.2, max: 0.5 },
              ease: "power1.inOut",
            },
            onUpdate: (self) => {
              const idx = Math.round(self.progress * last);
              if (idx !== activeRef.current) {
                activeRef.current = idx;
                setActive(idx);
              }
            },
          },
        });

        stRef.current = tl.scrollTrigger ?? null;

        // Crossfade each consecutive pair of panels.
        for (let i = 0; i < last; i++) {
          const position = i;
          tl.to(
            panels[i],
            { autoAlpha: 0, duration: 1 },
            position
          )
            .fromTo(
              panels[i + 1],
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 1 },
              position
            )
            // Phone fades in on the incoming panel.
            .fromTo(
              phones[i + 1],
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.8 },
              position + 0.15
            );
        }
      });

      // Reduced-motion fallback: no pin, panels are toggled by the tabs via
      // React state + CSS only (handled in the markup classes below).
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
        gsap.set(panels, { clearProps: "all" });
        stRef.current = null;
      });
    }, trigger);

    return () => ctx.revert();
  }, []);

  const goToPanel = (idx: number) => {
    const st = stRef.current;
    if (!st) {
      // Reduced-motion / no pin: just swap content.
      activeRef.current = idx;
      setActive(idx);
      return;
    }
    const last = PANELS.length - 1;
    const target = st.start + (st.end - st.start) * (idx / last);
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2 });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  return (
    <section ref={triggerRef} className="relative bg-white">
      {/* Lead-in spacer — gives the section breathing room before the tabs
          pin, mirroring the reference site's .spacer-sticky container. */}
      <div aria-hidden="true" className="h-10 bg-white md:h-14 lg:h-16" />

      <div ref={pinRef} className="relative h-screen overflow-hidden bg-white">
        {/* Persistent tabs — highlight follows the active panel */}
        <div className="absolute inset-x-0 top-16 z-20 flex flex-wrap justify-center gap-2.5 md:gap-3">
          {PANELS.map((panel, idx) => (
            <button
              key={panel.label}
              type="button"
              onClick={() => goToPanel(idx)}
              aria-pressed={active === idx}
              className={cn(
                "h-9 rounded-[14px] px-5 text-sm font-extrabold tracking-tight ring-0 transition-colors duration-300 md:h-10 md:px-6 md:text-[15px]",
                active === idx
                  ? "bg-[#3B33BD] text-[#ccff00] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_-4px_8px_0_rgba(255,255,255,0.16),inset_0_5px_10px_0_rgba(0,0,0,0.35),0_6px_16px_-8px_rgba(59,51,189,0.8)]"
                  : "bg-[#D9D5E0] text-[#0A0A0A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),inset_0_-2px_4px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.08)] hover:bg-[#D9D5E0]/80"
              )}
            >
              {panel.label}
            </button>
          ))}
        </div>

        {/* Stage — each panel stacked, crossfaded by the timeline */}
        <div className="absolute inset-x-0 bottom-0 top-32">
          {PANELS.map((panel, idx) => (
            <div
              key={panel.label}
              ref={(el) => {
                panelRefs.current[idx] = el;
              }}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-start px-5 pb-6 text-center will-change-transform md:justify-start md:pb-0",
                // CSS fallback for reduced motion (GSAP overrides when active)
                active === idx
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              )}
            >
              <h2 className="font-display text-3xl font-bold uppercase leading-[0.95] tracking-tight text-[#0A0A0A] md:text-4xl lg:text-5xl">
                {panel.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>

              {panel.subtitle ? (
                <p className="mx-auto mt-3 max-w-md text-xs font-semibold text-[#0A0A0A] md:text-sm">
                  {panel.subtitle}
                </p>
              ) : null}

              <div className="mt-6 flex w-full min-h-0 flex-1 max-w-5xl flex-col items-center justify-center gap-6 md:mt-8 md:flex-row md:items-center md:gap-20 lg:gap-28">
                <div
                  ref={(el) => {
                    phoneRefs.current[idx] = el;
                  }}
                  className="flex min-h-0 flex-1 shrink items-center justify-center md:h-full md:max-h-full md:flex-none md:w-auto"
                >
                  <PhoneMock
                    className="!h-full !w-auto !max-h-full !max-w-full md:!max-w-[300px]"
                    label={`${panel.label} preview`}
                  >
                    {/* Placeholder screen — animate the inside per tab later */}
                    <div
                      data-tab={panel.label.toLowerCase()}
                      className="flex h-full w-full items-center justify-center"
                    >
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B6680]">
                        {panel.label}
                      </span>
                    </div>
                  </PhoneMock>
                </div>

                <div className="flex max-w-xs shrink-0 flex-col items-center text-center md:items-start md:text-left">
                  <p className="text-center text-sm font-bold leading-relaxed text-[#0A0A0A] md:text-left md:text-base">
                    {panel.body}
                  </p>
                  <PrimarySwipeButton
                    asChild
                    className="mx-auto mt-6 h-12 px-7 text-base text-[#ccff00] md:mx-0 md:h-14 md:px-9 md:text-lg"
                  >
                    <Link href="/onboarding">{panel.cta}</Link>
                  </PrimarySwipeButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trailing spacer — breathing room after the tabs unpin, before the
          next section (mirrors the reference site's bottom margin). */}
      <div aria-hidden="true" className="h-10 bg-white md:h-14 lg:h-16" />
    </section>
  );
}
