import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({
  cards = 3,
  titleWidth = "w-48"
}: {
  cards?: number;
  titleWidth?: string;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-5 sm:max-w-3xl sm:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className={`h-9 ${titleWidth}`} />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="glass-elevated space-y-3 rounded-[1.75rem] p-5">
          <div className="flex gap-3">
            <Skeleton className="size-11" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-24 w-full" />
        </div>
      ))}
    </div>
  );
}
