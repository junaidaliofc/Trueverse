import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
  label
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full origin-left rounded-full bg-brand transition-[width] duration-700 ease-out",
            barClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
