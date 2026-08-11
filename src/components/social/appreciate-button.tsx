"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Appreciation is social reciprocity / XP-adjacent.
 * It never mutates trust.
 */
export function AppreciateButton({
  activityId,
  initialCount,
  initialAppreciated = false,
  className
}: {
  activityId: string;
  initialCount: number;
  initialAppreciated?: boolean;
  className?: string;
}) {
  const [appreciated, setAppreciated] = useState(initialAppreciated);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      const next = !appreciated;
      setAppreciated(next);
      setCount((value) => (next ? value + 1 : Math.max(0, value - 1)));
      try {
        await fetch("/api/social/appreciate", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity_id: activityId })
        });
      } catch {
        // Optimistic demo fallback
      }
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={onToggle}
      aria-pressed={appreciated}
      className={cn(appreciated && "bg-brand-soft text-brand", className)}
    >
      <Heart className={cn("size-4", appreciated && "fill-current")} />
      <span className="tabular-nums">{count}</span>
      <span className="sr-only">Appreciate</span>
    </Button>
  );
}
