import { Skeleton } from "@/components/ui/skeleton";

export function WordCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border/60 bg-card p-5 shadow-card">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-9 w-32 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="mt-4 h-16 w-full rounded-xl" />
    </div>
  );
}
