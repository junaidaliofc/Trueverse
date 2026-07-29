import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground ring-border",
        brand: "bg-brand-soft text-brand ring-brand/20",
        success: "bg-success-soft text-success ring-success/20",
        warning: "bg-warning-soft text-warning ring-warning/20",
        danger: "bg-danger-soft text-danger ring-danger/20",
        xp: "bg-xp-soft text-xp ring-xp/20",
        premium: "bg-accent text-accent-foreground ring-transparent",
        info: "bg-brand-soft text-brand ring-brand/15"
      }
    },
    defaultVariants: {
      tone: "neutral"
    }
  }
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
