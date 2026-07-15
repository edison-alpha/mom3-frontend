import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";

export function MarketDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading live market details">
      <section className="mt-4 rounded-[24px] border border-white/10 bg-[#111217] p-3.5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonText className="h-5 w-36" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <SkeletonText className="h-3 w-full" />
            <SkeletonText className="h-3 w-3/4" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <SkeletonText className="h-3 w-20" />
            <SkeletonText className="h-8 w-28" />
          </div>
          <div className="flex flex-col items-end space-y-2">
            <SkeletonText className="h-3 w-10" />
            <SkeletonText className="h-7 w-24" />
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-9 flex-1 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-3 h-44 w-full rounded-[22px]" />
      </section>

      <section className="mt-3 grid grid-cols-3 overflow-hidden rounded-[20px] border border-white/10 bg-[#111217] p-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2 px-2">
            <SkeletonText className="h-3 w-10" />
            <SkeletonText className="h-4 w-16" />
          </div>
        ))}
      </section>

      <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5">
        <SkeletonText className="h-4 w-28" />
        <SkeletonText className="mt-3 h-3 w-full" />
        <SkeletonText className="mt-2 h-3 w-4/5" />
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <SkeletonText className="h-3 w-20" />
          <SkeletonText className="h-3 w-24" />
        </div>
      </section>

      <section className="mt-3 rounded-[22px] border border-white/10 bg-[#111217] p-3.5">
        <div className="flex items-center gap-3">
          <SkeletonCircle className="h-9 w-9" />
          <div className="flex-1 space-y-2">
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
        <Skeleton className="mt-3 h-12 w-full rounded-full" />
      </section>

      <span className="sr-only">Fetching live APY, TVL, risk, and transaction availability</span>
    </div>
  );
}
