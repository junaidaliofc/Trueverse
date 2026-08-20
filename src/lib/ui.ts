import { cn } from "@/lib/utils";

export function chipClass(active: boolean, className?: string) {
  return cn(
    "rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-foreground/80 hover:bg-muted/80 hover:text-foreground",
    className
  );
}
