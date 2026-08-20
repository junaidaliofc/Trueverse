import { cn } from "@/lib/utils";

export function TypingIndicator({
  visible = false,
  name
}: {
  visible?: boolean;
  name?: string;
}) {
  if (!visible) return null;

  return (
    <div
      className="flex items-end gap-2"
      role="status"
      aria-live="polite"
      aria-label={name ? `${name} is typing` : "Typing"}
    >
      <div className="rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5">
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={cn(
                "size-1.5 rounded-full bg-muted-foreground/70",
                "animate-pulse"
              )}
              style={{ animationDelay: `${dot * 120}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
