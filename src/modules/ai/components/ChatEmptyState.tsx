import { AppIcon } from "@/components/ui/app-icon";
import Image from "next/image";

import { BrandCard } from "@/components/ui/brand-card";

export function ChatEmptyState({ onGetStrategy }: { onGetStrategy: () => void }) {
  return (
    <BrandCard className="border-transparent bg-transparent p-5 text-center shadow-none">
      <div className="flex justify-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#3B33BD]/20 shadow-[0_0_50px_-18px_rgba(59,51,189,0.95)]">
          <Image
            src="/caracter.png"
            alt="mom3 AI character"
            width={96}
            height={52}
            className="h-auto w-24"
          />
        </div>
      </div>
      <p className="mt-7 text-base font-black text-white">
        AI-Powered Smart Strategies
      </p>
      <p className="mx-auto mt-2 max-w-[250px] text-xs font-medium leading-relaxed text-[#A7A7B7]">
        Get universal real-time market analysis and insight with AI.
      </p>
      <button
        type="button"
        onClick={onGetStrategy}
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#3B33BD] px-6 text-sm font-black text-[#ccff00] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#ccff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
      >
        Get AI Strategies
        <AppIcon icon="lucide:arrow-right" aria-hidden="true" width={17} height={17} className="ml-2" />
      </button>
    </BrandCard>
  );
}
