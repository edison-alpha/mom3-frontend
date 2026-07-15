import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";

import type { RecommendationItem } from "../types/ai.types";

export function RecommendationCard({
  item,
  onSelect,
}: {
  item: RecommendationItem;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onSelect}
      variant="plain"
      size="lg"
      rounded="lg"
      className="group w-full rounded-[22px] border border-[#3B33BD]/80 bg-[radial-gradient(circle_at_0%_0%,rgba(59,51,189,0.42),rgba(8,9,36,0.94)_42%,rgba(5,6,19,0.98)_100%)] p-3 text-left shadow-[0_14px_36px_-24px_rgba(59,51,189,0.9)] transition-transform active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#3B33BD]"
    >
      <div className="flex gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
          <AppIcon
            icon={item.icon}
            aria-hidden="true"
            width={30}
            height={30}
            className={item.iconTone}
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="flex items-center gap-1.5 text-[15px] font-black leading-tight text-white">
                <AppIcon
                  icon="solar:stars-bold"
                  aria-hidden="true"
                  width={15}
                  height={15}
                  className="text-[#ccff00]"
                />
                {item.title}
              </span>
              <span className="mt-1.5 block text-xs font-medium leading-relaxed text-[#A7A7B7]">
                {item.description}
              </span>
            </span>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-black text-[#ccff00]">
              {item.badge}
            </span>
          </span>

          <span className="mt-3 flex flex-wrap gap-1.5">
            {item.chips.map((chip) => (
              <span
                key={`${item.title}-${chip.label}`}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 text-xs font-bold text-white"
              >
                <AppIcon icon={chip.icon} aria-hidden="true" width={16} height={16} />
                {chip.label}
              </span>
            ))}
          </span>
        </span>

        <span className="flex items-center text-[#BDBDCC]">
          <AppIcon
            icon="lucide:chevron-right"
            aria-hidden="true"
            width={20}
            height={20}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Button>
  );
}
