import { MobileShell } from "@/components/ui/mobile-shell";
import {
  Skeleton,
  SkeletonPageHeader,
  SkeletonText,
} from "@/components/ui/skeleton";

export function DepositSkeleton() {
  return (
    <MobileShell>
      <SkeletonPageHeader hasBack />
      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <SkeletonText className="h-4 w-32" />
          <div className="flex gap-2 overflow-hidden">
            <Skeleton className="h-11 w-24 shrink-0 rounded-full" />
            <Skeleton className="h-11 w-28 shrink-0 rounded-full" />
            <Skeleton className="h-11 w-24 shrink-0 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-80 rounded-[28px]" />
        <Skeleton className="h-28 rounded-[24px]" />
      </div>
    </MobileShell>
  );
}

