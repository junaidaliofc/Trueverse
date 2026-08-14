import { Skeleton } from "@/components/ui/skeleton";

export function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 rounded-2xl p-3">
          <Skeleton className="size-11 shrink-0 rounded-2xl bg-foreground/15" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-32 bg-foreground/15" />
              <Skeleton className="h-3 w-10 bg-foreground/10" />
            </div>
            <Skeleton className="h-3 w-24 bg-foreground/10" />
            <Skeleton className="h-3 w-5/6 bg-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatThreadSkeleton() {
  return (
    <div className="flex h-full flex-col" aria-hidden>
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <Skeleton className="size-11 rounded-2xl bg-foreground/15" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 bg-foreground/15" />
          <Skeleton className="h-3 w-28 bg-foreground/10" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4">
        <Skeleton className="h-12 w-3/5 rounded-2xl bg-foreground/10" />
        <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl bg-foreground/15" />
        <Skeleton className="h-16 w-2/3 rounded-2xl bg-foreground/10" />
        <Skeleton className="ml-auto h-10 w-1/3 rounded-2xl bg-foreground/15" />
      </div>
    </div>
  );
}
