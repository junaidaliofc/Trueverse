import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20 bg-foreground/15" />
        <Skeleton className="h-9 w-56 bg-foreground/15" />
        <Skeleton className="h-4 w-80 max-w-full bg-foreground/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-[1.6rem] bg-foreground/10" />
        ))}
      </div>
    </div>
  );
}
