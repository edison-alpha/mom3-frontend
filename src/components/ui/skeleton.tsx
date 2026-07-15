import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-2xl bg-white/[0.08] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-3 rounded-full", className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn("rounded-full", className)} />;
}

export function SkeletonPageHeader({
  hasBack = false,
  hasAction = false,
}: {
  hasBack?: boolean;
  hasAction?: boolean;
}) {
  return (
    <div className="relative flex h-12 items-center justify-center">
      {hasBack ? <SkeletonCircle className="absolute left-0 h-10 w-10" /> : null}
      <SkeletonText className="h-5 w-28" />
      {hasAction ? <SkeletonCircle className="absolute right-0 h-10 w-10" /> : null}
    </div>
  );
}

export function SkeletonListRow({
  className,
  avatarClassName,
}: SkeletonProps & {
  avatarClassName?: string;
}) {
  return (
    <div className={cn("flex min-h-[72px] items-center gap-3 px-4 py-3", className)}>
      <Skeleton className={cn("h-11 w-11 shrink-0 rounded-2xl", avatarClassName)} />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonText className="h-4 w-28" />
        <SkeletonText className="h-3 w-40" />
      </div>
      <div className="w-16 space-y-2">
        <SkeletonText className="ml-auto h-3.5 w-14" />
        <SkeletonText className="ml-auto h-3 w-10" />
      </div>
    </div>
  );
}

export function SkeletonBottomSearch() {
  return (
    <div className="fixed inset-x-0 bottom-7 z-40 flex justify-center px-5">
      <div className="flex h-14 w-full max-w-md items-center gap-3 rounded-full bg-[#1C1C1E]/90 px-5">
        <SkeletonCircle className="h-6 w-6" />
        <SkeletonText className="h-4 flex-1" />
      </div>
    </div>
  );
}
