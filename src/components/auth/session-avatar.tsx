"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";

export function SessionAvatar() {
  const [name, setName] = useState("Member");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!active || !payload?.profile) return;
        setName(payload.profile.full_name || "Member");
        setPhoto(payload.profile.photo_url ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <Link href="/passport" className="rounded-2xl p-1 transition hover:bg-muted">
      <UserAvatar name={name} src={photo} size="sm" />
    </Link>
  );
}
