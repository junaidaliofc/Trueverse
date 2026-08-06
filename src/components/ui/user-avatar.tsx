import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "!size-8 text-xs",
  default: "!size-10 text-sm",
  md: "!size-11 text-sm",
  lg: "!size-16 text-lg",
  xl: "!size-24 text-3xl"
} as const;

/** Product avatar — wraps shadcn Avatar with Trueverse name/photo API. */
export function UserAvatar({
  name,
  src,
  size = "default",
  className
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const initials = (name || "T")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar
      className={cn(sizeClass[size], "rounded-2xl after:rounded-2xl", className)}
      size={size === "sm" ? "sm" : size === "lg" || size === "xl" ? "lg" : "default"}
    >
      {src ? <AvatarImage src={src} alt={name} className="rounded-2xl" /> : null}
      <AvatarFallback className="rounded-2xl bg-muted font-semibold text-muted-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
