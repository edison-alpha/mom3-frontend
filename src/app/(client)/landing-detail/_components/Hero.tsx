"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import PhoneMock from "./PhoneMock";
import { PrimarySwipeButton } from "@/components/ui/swipper-button";

export default function Hero() {
  return (
    <section className="relative bg-[#E6E1F0] px-5 pt-2 pb-12 md:px-10 md:pt-3 md:pb-20">
      <div className="mx-auto mt-20 max-w-6xl text-center md:mt-28">
        <h1 className="font-display text-stroke-bold text-5xl font-black leading-[0.95] tracking-tight text-[#0A0A0A] md:text-6xl lg:text-[88px]">
          <span className="block">One wallet.</span>
          <span className="block">Smarter yield.</span>
          <span className="block">Less guessing.</span>
        </h1>

        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#3B33BD] md:mt-12 md:text-sm">
          AI powered DeFi for everyday assets
        </p>

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#0A0A0A] md:text-base">
          Deposit once.
          <br />
          Lend, borrow, and earn across trusted markets.
          <br />
          Let mom3 suggest when to rebalance.
        </p>

        <div className="mt-7 flex justify-center">
          <PrimarySwipeButton
            asChild
            className="h-12 px-7 text-base text-[#ccff00] md:h-14 md:px-9 md:text-lg"
          >
            <Link href="/onboarding">Start Earning</Link>
          </PrimarySwipeButton>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-[#6B6680]">
          <span className="uppercase tracking-[0.2em]">scroll down</span>
          <motion.span
            aria-hidden="true"
            className="flex h-6 w-4 items-start justify-center rounded-full border-2 border-[#6B6680] p-[3px]"
            animate={{ y: [0, 3, 0] }}
            transition={{
              duration: 1.6,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <motion.span
              className="block h-1 w-[3px] rounded-full bg-[#6B6680]"
              animate={{ y: [0, 5, 0], opacity: [1, 0.2, 1] }}
              transition={{
                duration: 1.6,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </motion.span>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-md justify-center md:mt-16">
        <PhoneMock
          className="max-w-[300px] md:max-w-[340px]"
          screenClassName="bg-[#0A0A0A]"
          dark
          label="mom3 app preview"
        >
          <div className="flex h-full w-full items-center justify-center p-10">
            <Image
              src="/brand-logo.png"
              alt="mom3 logo"
              width={160}
              height={160}
              className="h-auto w-1/3 max-w-[90px] object-contain"
              priority
            />
          </div>
        </PhoneMock>
      </div>
    </section>
  );
}
