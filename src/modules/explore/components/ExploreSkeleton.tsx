import {
  Skeleton,
  SkeletonBottomSearch,
  SkeletonCircle,
  SkeletonListRow,
  SkeletonPageHeader,
  SkeletonText,
} from "@/components/ui/skeleton";
import { MobileShell } from "@/components/ui/mobile-shell";

export function ExploreSkeleton() {
  return (
    <MobileShell bottomSlot={<SkeletonBottomSearch />}>
      <SkeletonPageHeader hasBack hasAction />

      <section className="mt-4 overflow-hidden">
        <div className="flex gap-3 overflow-hidden pb-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="min-w-[82%] rounded-[24px] bg-[#1C1C1E] p-4">
              <div className="flex items-start justify-between">
                <SkeletonCircle className="h-12 w-12" />
                <SkeletonCircle className="h-10 w-10" />
              </div>
              <SkeletonText className="mt-5 h-4 w-32" />
              <SkeletonText className="mt-2 h-3 w-44" />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <Skeleton className="h-2 w-5 rounded-full" />
          <SkeletonCircle className="h-2 w-2" />
        </div>
      </section>

      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="mt-6">
          <SkeletonText className="h-5 w-36" />
          <div className="mt-3 overflow-hidden rounded-[28px] bg-[#1C1C1E] p-3">
            {Array.from({ length: sectionIndex === 2 ? 2 : 3 }).map((__, rowIndex) => (
              <SkeletonListRow key={rowIndex} className="rounded-[20px] px-2" />
            ))}
          </div>
        </section>
      ))}
    </MobileShell>
  );
}

function MarketSectionSkeleton({ title, rows = 3 }: { title: string; rows?: number }) {
  return (
    <section className="mt-6" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white/70">{title}</h2>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="mt-3 overflow-hidden rounded-[28px] bg-[#1C1C1E] p-3">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonListRow key={index} className="rounded-[20px] px-2" />
        ))}
      </div>
    </section>
  );
}

export function ExploreMarketSectionsSkeleton() {
  return (
    <div role="status" aria-label="Loading yield markets">
      <MarketSectionSkeleton title="Best Yield" rows={3} />
      <MarketSectionSkeleton title="Aave" rows={2} />
      <MarketSectionSkeleton title="Morpho" rows={2} />
      <MarketSectionSkeleton title="Compound" rows={2} />
      <span className="sr-only">Loading Best Yield, Aave, Morpho, and Compound markets</span>
    </div>
  );
}
