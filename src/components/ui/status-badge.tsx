import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva("", {
  variants: {
    tone: {
      neutral: "border-transparent bg-muted text-muted-foreground",
      brand: "border-transparent bg-brand-soft text-brand",
      success: "border-transparent bg-success-soft text-success",
      warning: "border-transparent bg-warning-soft text-warning",
      danger: "border-transparent bg-danger-soft text-danger",
      xp: "border-transparent bg-xp-soft text-xp",
      premium: "border-transparent bg-accent text-accent-foreground",
      info: "border-transparent bg-brand-soft text-brand"
    }
  },
  defaultVariants: {
    tone: "neutral"
  }
});

/** Semantic status chip built on shadcn Badge. */
export function StatusBadge({
  className,
  tone,
  children,
  ...props
}: React.ComponentProps<typeof Badge> & VariantProps<typeof statusBadgeVariants>) {
  return (
    <Badge
      variant="secondary"
      className={cn("h-6 rounded-full px-2.5 text-xs font-semibold", statusBadgeVariants({ tone }), className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
