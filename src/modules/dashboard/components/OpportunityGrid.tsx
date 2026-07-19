import { Sprout } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { opportunityCards } from "../constants/dashboard";

export function OpportunityGrid() {
  return (
    <section className="mt-4 grid grid-cols-2 gap-2.5">
      {opportunityCards.map((card) => (
        <Link href={card.title === "AI Yield Strategy" ? "/agent" : "/explore"} key={card.title} className="block min-h-0 rounded-[22px] focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
        <motion.div
          key={card.title}
          whileTap={{ scale: 0.97 }}
          className="rounded-[22px] bg-[#1C1C1E] p-3.5 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#202024]"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A3E] text-[#ccff00] transition-transform duration-500 hover:rotate-6">
              <Sprout className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold leading-tight text-white">
              {card.title}
            </p>
          </div>
          <p className="mt-3 text-sm font-bold leading-tight text-white">
            {card.subtitle}
          </p>
          <p className="mt-1 text-xs font-medium leading-snug text-[#9A9AA2]">
            {card.title === "AI Yield Strategy"
              ? "Matched to your risk profile"
              : "Compare live APYs across protocols"}
          </p>
        </motion.div>
        </Link>
      ))}
    </section>
  );
}
