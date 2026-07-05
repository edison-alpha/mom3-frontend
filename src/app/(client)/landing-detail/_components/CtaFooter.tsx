import Image from "next/image";
import Link from "next/link";

import { PrimarySwipeButton } from "@/components/ui/swipper-button";

type FooterColumn = {
  title: string;
  links: string[];
};

const COLUMNS: FooterColumn[] = [
  {
    title: "Wallet",
    links: [
      "Track Assets",
      "Send Funds",
      "Convert Tokens",
      "Activity History",
      "Help Center",
    ],
  },
  {
    title: "DeFi",
    links: [
      "Lending Markets",
      "Borrow Positions",
      "AI Rebalancing",
      "Risk Review",
      "Strategy Details",
    ],
  },
];

export default function CtaFooter() {
  return (
    <section className="bg-white px-6 pt-8 pb-8 md:px-20 md:pt-12 md:pb-12">
      <footer className="relative mx-auto w-full overflow-hidden rounded-[36px] bg-[#0A0A0A] px-6 pt-12 pb-10 text-white md:rounded-[56px] md:px-16 md:pt-20 md:pb-12">
        {/* Top hero */}
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand-logo.png"
            alt="mom3"
            width={56}
            height={56}
            className="h-12 w-12 object-contain md:h-14 md:w-14"
          />

          <h2 className="font-display text-stroke-bold mt-8 text-5xl font-black uppercase leading-[0.95] tracking-tight text-white md:mt-10 md:text-6xl lg:text-7xl">
            <span className="block">Put your</span>
            <span className="block">assets to</span>
            <span className="block">work</span>
          </h2>

          <p className="mt-6 text-xs text-white/70 md:text-sm">
            Start with a wallet, then let mom3 guide your next strategy.
          </p>

          <div className="mt-6">
            <PrimarySwipeButton
              asChild
              className="h-12 px-7 text-base text-[#ccff00] md:h-14 md:px-9 md:text-lg"
            >
              <Link href="/onboarding">Get Started</Link>
            </PrimarySwipeButton>
          </div>
        </div>

        {/* Columns */}
        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-10 md:px-8 lg:px-16">
          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-3">
              <h3 className="text-sm font-bold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/70 transition hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-6">
            <h3 className="text-sm font-bold text-white">Subscribe</h3>
            <form
              className="mt-4 flex h-16 items-center gap-1 rounded-full bg-white/15 p-1.5 pl-6 backdrop-blur-sm md:h-[68px]"
              action="#"
              method="post"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Enter your email...."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none md:text-base"
              />
              <button
                type="submit"
                className="h-full rounded-full bg-white/25 px-7 text-sm font-semibold text-white shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.15),inset_0_2px_4px_0_rgba(255,255,255,0.25)] transition hover:bg-white/30 md:text-base"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex items-center justify-between md:mt-20 md:px-8 lg:px-16">
          <Image
            src="/brand-logo.png"
            alt="mom3"
            width={40}
            height={40}
            className="h-9 w-9 object-contain md:h-10 md:w-10"
          />
          <div className="flex items-center gap-6 text-xs text-white/80 md:text-sm">
            <a href="#" className="transition hover:text-white">
              Term &amp; Condition
            </a>
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
