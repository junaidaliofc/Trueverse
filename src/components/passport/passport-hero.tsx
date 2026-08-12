"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, QrCode, Share2 } from "lucide-react";
import type { Profile } from "@/lib/types";
import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/design";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { LabeledProgress } from "@/components/ui/progress-field";
import { cn } from "@/lib/utils";

export function PassportHero({
  profile,
  username,
  trustLevel,
  emailVerified = false,
  identityVerified = false,
  xpLevel,
  profileCompletion,
  shareHref,
  qrHref,
  isOwner = false,
  className
}: {
  profile: Profile;
  username?: string;
  trustLevel: TrustLevel;
  emailVerified?: boolean;
  identityVerified?: boolean;
  xpLevel: number;
  profileCompletion: number;
  shareHref: string;
  qrHref?: string;
  isOwner?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const meta = TRUST_LEVEL_META[trustLevel];
  const handle = username || profile.username || profile.trueverse_id.replace(/^tv_/, "");
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });

  return (
    <motion.section
      className={cn("relative overflow-hidden rounded-[2rem] text-white", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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

      <div className="relative px-5 pb-7 pt-7 sm:px-8 sm:pb-8 sm:pt-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.28em] text-teal-100">
              Trueverse Passport
            </p>
            {isOwner ? (
              <p className="mt-1 text-xs text-teal-100/80">Your portable digital identity</p>
            ) : null}
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
            {qrHref ? (
              <Button
                asChild
                size="icon-sm"
                variant="secondary"
                className="min-h-10 min-w-10 rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
              >
                <Link href={qrHref} aria-label="Open QR code">
                  <QrCode className="size-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <motion.div
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[1.75rem] bg-white/10 p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/20"
          >
            <UserAvatar
              name={profile.full_name}
              src={profile.photo_url}
              size="xl"
              className="!size-28 rounded-[1.5rem] text-3xl after:rounded-[1.5rem] sm:!size-32"
            />
          </motion.div>

          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {profile.full_name || "Trueverse Member"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-teal-100">@{handle}</p>
          <p className="mt-1 font-mono text-xs text-teal-100/75">{profile.trueverse_id}</p>
          {profile.headline ? (
            <p className="mt-3 max-w-md text-sm text-teal-50/90">{profile.headline}</p>
          ) : null}
          {profile.city ? (
            <p className="mt-1 text-xs text-teal-100/80">{profile.city}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <TrustLevelBadge
              level={trustLevel}
              className="bg-white/15 text-white ring-1 ring-white/25"
            />
            {emailVerified ? (
              <StatusBadge className="bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-200/30">
                <BadgeCheck className="mr-1 inline size-3.5" />
                Email verified
              </StatusBadge>
            ) : (
              <StatusBadge className="bg-white/10 text-teal-50">Email unverified</StatusBadge>
            )}
            {identityVerified ? (
              <StatusBadge className="bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-200/30">
                <BadgeCheck className="mr-1 inline size-3.5" />
                Identity verified
              </StatusBadge>
            ) : null}
            <StatusBadge className="bg-orange-400/20 text-orange-50 ring-1 ring-orange-200/30">
              XP Level {xpLevel}
            </StatusBadge>
          </div>

          <p className="mt-4 text-xs text-teal-100/80">Member since {memberSince}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-teal-50/80">{meta.description}</p>

          <div className="mt-6 w-full max-w-xs">
            <LabeledProgress
              value={profileCompletion}
              label="Profile completion"
              className="[&_span]:text-teal-100/80"
              indicatorClassName="bg-teal-300"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
