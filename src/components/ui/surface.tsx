import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Soft glass surface for consumer screens — composes shadcn Card. */
export function Surface({
  className,
  elevated = false,
  children,
  ...props
}: React.ComponentProps<typeof Card> & { elevated?: boolean }) {
  return (
    <Card
      className={cn(
        "rounded-3xl border-0 bg-transparent py-0 ring-0 shadow-none",
        elevated ? "glass-elevated" : "glass",
        "gap-0 p-5 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export function SurfaceHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn("mb-4 px-0", className)} {...props} />;
}

export function SurfaceTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      className={cn("font-display text-xl font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function SurfaceDescription({ className, ...props }: React.ComponentProps<typeof CardDescription>) {
  return <CardDescription className={cn("mt-1", className)} {...props} />;
}

export function SurfaceContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn("px-0", className)} {...props} />;
}

export { CardAction as SurfaceAction, CardFooter as SurfaceFooter };
