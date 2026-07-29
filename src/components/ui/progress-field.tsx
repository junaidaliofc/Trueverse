"use client";

import { cn } from "@/lib/utils";

/** Token-driven progress bar for XP / missions / DNA. Complements shadcn Progress. */
export function LabeledProgress({
  value,
  label,
  className,
  indicatorClassName = "bg-primary"
}: {
  value: number;
  label?: string;
  className?: string;
  indicatorClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(clamped)}%</span>
        </div>
      ) : null}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", indicatorClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
