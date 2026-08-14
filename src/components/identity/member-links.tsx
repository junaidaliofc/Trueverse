import Link from "next/link";
import { cn } from "@/lib/utils";
import { passportUsername } from "@/lib/passport";

export function passportHrefFromHandle(id: string) {
  return `/u/${id.replace(/^@/, "").replace(/^tv_/, "").toLowerCase()}`;
}

export function TrueverseIdLink({
  id,
  className
}: {
  id: string;
  className?: string;
}) {
  const display = id.startsWith("tv_") || id.startsWith("@") ? id : `tv_${id}`;
  return (
    <Link
      href={passportHrefFromHandle(id)}
      className={cn(
        "font-mono text-[11px] text-muted-foreground hover:text-primary hover:underline",
        className
      )}
    >
      {display}
    </Link>
  );
}

export function MemberNameLink({
  name,
  trueverseId,
  username,
  className
}: {
  name: string;
  trueverseId?: string | null;
  username?: string | null;
  className?: string;
}) {
  const href = trueverseId
    ? `/u/${passportUsername({ trueverse_id: trueverseId, username })}`
    : "#";
  return (
    <Link href={href} className={cn("font-semibold text-foreground hover:text-primary", className)}>
      {name}
    </Link>
  );
}
