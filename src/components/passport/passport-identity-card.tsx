"use client";

import Link from "next/link";
import { BadgeCheck, QrCode, Share2, ShieldAlert } from "lucide-react";
import type { Profile } from "@/lib/types";
import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/design";
import { PASSPORT_TRUST_TITLES } from "@/lib/passport-mock";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PassportIdentityCard({
  profile,
  username,
  trustLevel,
  emailVerified = false,
  identityVerified = false,
  shareHref,
  className
}: {
  profile: Profile;
  username?: string;
  trustLevel: TrustLevel;
  emailVerified?: boolean;
  identityVerified?: boolean;
  shareHref: string;
  className?: string;
}) {
  const meta = TRUST_LEVEL_META[trustLevel];
  const title = PASSPORT_TRUST_TITLES[trustLevel];
  const handle = username || profile.username || profile.trueverse_id.replace(/^tv_/, "");
  const displayName = profile.full_name?.trim() || "Trueverse Member";
  const mrzName = handle.replace(/[^a-z0-9]/gi, "").toUpperCase().padEnd(18, "<").slice(0, 18);
  const mrzId = profile.trueverse_id.replace(/[^a-z0-9_]/gi, "").toUpperCase();

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] text-white shadow-[0_24px_80px_-32px_rgba(13,148,136,0.55)]",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(155deg,#0f3f3a_0%,#123f3a_42%,#0b2e2a_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(45,212,191,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(15,118,110,0.45), transparent 50%), repeating-linear-gradient(118deg, transparent, transparent 14px, rgba(255,255,255,0.03) 14px, rgba(255,255,255,0.03) 15px)"
        }}
      />

      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.28em] text-teal-100">
              Trueverse Passport
            </p>
            <p className="mt-1 text-xs text-teal-100/75">Digital reputation identity</p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="min-h-10 rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            >
              <Link href={shareHref}>
                <Share2 className="size-3.5" />
                Share
              </Link>
            </Button>
            <Button
              asChild
              size="icon-sm"
              variant="secondary"
              className="min-h-10 min-w-10 rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            >
              <Link href={shareHref} aria-label="Open QR code">
                <QrCode className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="relative rounded-[1.75rem] bg-white/10 p-1.5 ring-1 ring-white/20">
            <span
              aria-hidden
              className="absolute -left-3 top-6 hidden h-8 w-6 rounded-sm bg-gradient-to-br from-amber-200/80 to-teal-200/40 ring-1 ring-white/30 sm:block"
            />
            <UserAvatar
              name={displayName}
              src={profile.photo_url}
              size="xl"
              className="!size-28 rounded-[1.5rem] text-3xl after:rounded-[1.5rem] sm:!size-32"
            />
          </div>

          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {displayName}
          </h2>
          <p className="mt-2 font-mono text-sm tracking-wide text-teal-100/90">
            {profile.trueverse_id}
          </p>
          <p className="mt-1 text-sm text-teal-100/75">@{handle}</p>

          <p className="mt-5 font-display text-xl font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-teal-50/85">
            Trust Level · {meta.label}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {identityVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-200/30">
                <BadgeCheck className="size-3.5" />
                Identity verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-50">
                <ShieldAlert className="size-3.5" />
                Identity unverified
              </span>
            )}
            {emailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-50">
                <BadgeCheck className="size-3.5" />
                Email verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-50">
                Email unverified
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="relative overflow-hidden border-t border-white/10 bg-black/20 px-5 py-3 font-mono text-[10px] tracking-[0.22em] text-teal-100/70 sm:px-8">
        TV&lt;&lt;{mrzName}&lt;&lt;{mrzId}
      </p>
    </section>
  );
}
