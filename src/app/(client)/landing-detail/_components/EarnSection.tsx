import { Icon } from "@iconify/react";
import Image from "next/image";

import PhoneMock from "./PhoneMock";

const TRIPS = [
  { label: "Trip to Bali", sub: "$3,500 to goal", amount: "3,700.21" },
  { label: "Trip to Bali", sub: "$3,500 to goal", amount: "3,700.21" },
  { label: "Trip to Bali", sub: "$3,500 to goal", amount: "3,700.21" },
];

export default function EarnSection() {
  return (
    <section
      id="earn"
      className="bg-lavender px-8 pt-10 pb-16 sm:px-10 md:pt-12 md:pb-20 lg:px-8 lg:pt-16 lg:pb-24"
    >
      <div className="mx-auto max-w-[592px] lg:max-w-[1040px] xl:max-w-[1120px]">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-ink lg:text-[12px]">
          What where all about
        </p>

        <h2 className="font-display mt-4 text-center text-4xl font-bold uppercase leading-[0.95] tracking-tight text-ink md:text-6xl lg:mt-5 lg:text-7xl">
          <span className="block">Earn coin.</span>
          <span className="block">Win collectibles.</span>
          <span className="block">Get close to.</span>
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:mt-16 lg:gap-5">
          {/* Top wide black card — fixed aspect ratio matches the design */}
          <article className="relative aspect-[1.05/1] overflow-hidden rounded-[32px] bg-ink text-white sm:col-span-2 sm:aspect-[2.1/1] lg:rounded-[40px]">
            {/* Brand mark */}
            <Image
              src="/brand-logo.png"
              alt="Oni"
              width={48}
              height={48}
              className="absolute left-6 top-6 z-10 h-7 w-7 object-contain brightness-0 invert md:left-8 md:top-8 lg:h-9 lg:w-9"
              priority={false}
            />

            {/* Heading — centered vertically, left half on desktop */}
            <div className="absolute inset-y-0 left-0 flex items-center px-6 sm:w-[52%] sm:px-10 lg:px-14 xl:px-16">
              <h3 className="font-display text-2xl font-bold leading-[1.05] tracking-tight text-white/55 sm:text-[34px] lg:text-[44px] xl:text-[50px]">
                Get <span className="text-white">paid</span> and send money
                anywhere
              </h3>
            </div>

            {/* PhoneMock — vertical-centered, bleeds slightly past the card
                bottom and is clipped by the card's overflow-hidden. */}
            <div className="pointer-events-none absolute right-4 top-1/2 [transform:translateY(-22%)] sm:right-9 sm:[transform:translateY(-18%)] lg:right-14 lg:[transform:translateY(-16%)] xl:right-16">
              <PhoneMock
                className="w-[140px] max-w-none sm:w-[210px] lg:w-[300px] xl:w-[330px]"
                label="Send money preview"
              />
            </div>
          </article>

          {/* Bottom-left black card with trip list */}
          <article className="min-h-[280px] rounded-[32px] bg-ink p-6 text-white sm:min-h-[300px] lg:min-h-[380px] lg:rounded-[40px] lg:p-8">
            <p className="text-center text-sm leading-snug text-white/70 sm:px-2 lg:text-base lg:px-4">
              <span className="font-semibold text-white">
                Spend from one balance.
              </span>{" "}
              Use your Avvio Visa card at 150M+ merchants. Apple Pay ready.
            </p>

            <ul className="mt-5 space-y-2.5 lg:mt-7 lg:space-y-3">
              {TRIPS.map((t, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-full bg-white px-3 py-2 pr-4 text-ink lg:px-4 lg:py-2.5 lg:pr-5"
                >
                  <span className="flex items-center gap-3 lg:gap-3.5">
                    <span
                      aria-hidden="true"
                      className="block h-7 w-7 rounded-full border-[2.5px] border-[#2d2eff] lg:h-8 lg:w-8"
                    />
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold lg:text-[15px]">
                        {t.label}
                      </span>
                      <span className="block text-[10px] text-[#6b6680] lg:text-[11px]">
                        {t.sub}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold lg:text-[15px]">
                    {t.amount}
                    <Icon
                      icon="ph:caret-right-bold"
                      aria-hidden="true"
                      width={12}
                      height={12}
                      className="text-[#6b6680]"
                    />
                  </span>
                </li>
              ))}
            </ul>
          </article>

          {/* Bottom-right column: blue + black stacked */}
          <div className="grid min-h-[280px] gap-4 sm:min-h-[300px] sm:grid-rows-[1fr_auto] lg:min-h-[380px] lg:gap-5">
            <article className="flex min-h-[150px] items-center justify-center rounded-[32px] bg-[#2d2eff] p-8 text-center text-white lg:rounded-[40px] lg:p-10">
              <p className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-[32px] xl:text-[36px]">
                Your money,
                <br />
                your control.
                <br />
                No one else.
              </p>
            </article>

            <article className="rounded-[32px] bg-ink p-6 text-white lg:rounded-[40px] lg:p-8">
              <p className="text-center text-sm leading-snug lg:text-base">
                <span className="font-semibold">
                  Every transaction is securely signed by Turnkey,
                </span>{" "}
                <span className="text-white/70">
                  with real time alerts for all activity
                </span>
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
