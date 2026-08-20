"use client";

import { useSyncExternalStore } from "react";
import { formatRelativeTime } from "@/lib/utils";

export function RelativeTime({ iso }: { iso: string }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  return <time dateTime={iso}>{mounted ? formatRelativeTime(iso) : iso.slice(0, 10)}</time>;
}
