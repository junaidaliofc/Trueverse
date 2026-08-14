"use client";

import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Textarea that grows with content. Complements field-sizing-content for older engines. */
export function AutoGrowTextarea({
  value,
  className,
  minHeight = 96,
  ...props
}: ComponentProps<typeof Textarea> & { value: string; minHeight?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [value, minHeight]);

  return (
    <Textarea
      {...props}
      ref={ref}
      value={value}
      className={cn(
        "resize-none overflow-hidden",
        minHeight >= 96 ? "min-h-24" : "min-h-11",
        className
      )}
    />
  );
}
