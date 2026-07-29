import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl"
} as const;

export function Avatar({
  name,
  src,
  size = "md",
  className
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const initials = (name || "T")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="96px" />
      ) : (
        <div className="flex size-full items-center justify-center font-bold text-muted-foreground">
          {initials}
        </div>
      )}
    </div>
  );
}
