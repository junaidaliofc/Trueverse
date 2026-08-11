"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Clock3,
  Mail,
  Phone,
  Shield,
  Users
} from "lucide-react";
import type { VerificationItem, VerificationKind, VerificationStatus } from "@/lib/design";
import { formatRelativeTime } from "@/lib/utils";
import { fadeUp, stagger } from "@/components/motion/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const kindIcon: Record<VerificationKind, typeof Mail> = {
  email: Mail,
  phone: Phone,
  identity: Shield,
  professional: Briefcase,
  community: Users,
  organization: Building2
};

const statusTone: Record<VerificationStatus, "success" | "warning" | "neutral"> = {
  verified: "success",
  pending: "warning",
  unverified: "neutral"
};

const statusLabel: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  unverified: "Unverified"
};

export function PassportVerification({
  items,
  className,
  hidden = false
}: {
  items: VerificationItem[];
  className?: string;
  hidden?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (hidden) {
    return (
      <section className={cn("glass rounded-[1.75rem] p-6 sm:p-7", className)}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Verification</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Hidden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Verification details are private for this Passport.
        </p>
      </section>
    );
  }

  const timeline = [...items]
    .filter((item) => item.status === "verified" && item.completed_at)
    .sort(
      (a, b) =>
        new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()
    );

  return (
    <section className={cn("glass rounded-[1.75rem] p-6 sm:p-7", className)}>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Verification</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
          Identity & process
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Factual verification state — not a moral judgment or safety claim.
        </p>
      </div>

      <motion.ul
        className="grid gap-3 sm:grid-cols-2"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={stagger}
      >
        {items.map((item) => {
          const Icon = kindIcon[item.kind];
          return (
            <motion.li
              key={item.kind}
              variants={fadeUp}
              className="rounded-[1.35rem] bg-muted/45 px-4 py-4 ring-1 ring-border/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Icon className="size-4" />
                </span>
                <StatusBadge tone={statusTone[item.status]}>
                  {statusLabel[item.status]}
                </StatusBadge>
              </div>
              <p className="mt-3 font-semibold text-foreground">{item.label}</p>
              {item.detail ? (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
              ) : null}
            </motion.li>
          );
        })}
      </motion.ul>

      {timeline.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-display text-lg font-bold tracking-tight">Verification timeline</h3>
          <ol className="relative mt-4 space-y-3">
            <div
              aria-hidden
              className="absolute bottom-2 left-[1.15rem] top-2 w-px bg-border"
            />
            {timeline.map((item) => {
              const Icon = kindIcon[item.kind];
              return (
                <li key={`${item.kind}-tl`} className="relative pl-11">
                  <span className="absolute left-1.5 top-1 flex size-8 items-center justify-center rounded-2xl bg-success-soft text-success">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="rounded-2xl bg-muted/40 px-4 py-3 ring-1 ring-border/40">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{item.label} verified</p>
                      <BadgeCheck className="size-3.5 text-success" />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3" />
                      {formatRelativeTime(item.completed_at!)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
