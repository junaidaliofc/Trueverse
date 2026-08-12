"use client";

import { BadgeCheck, Briefcase, GraduationCap, Mail, Phone, Shield } from "lucide-react";
import type { VerificationItem } from "@/lib/design";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const comingSoon = [
  { key: "phone", label: "Phone", icon: Phone, detail: "Coming soon" },
  { key: "identity", label: "Identity", icon: Shield, detail: "Coming soon" },
  { key: "employment", label: "Employment", icon: Briefcase, detail: "Coming soon" },
  { key: "education", label: "Education", icon: GraduationCap, detail: "Coming soon" }
] as const;

export function PassportVerification({
  items,
  className,
  hidden = false
}: {
  items: VerificationItem[];
  className?: string;
  hidden?: boolean;
}) {
  if (hidden) return null;

  const email = items.find((item) => item.kind === "email");
  const emailVerified = email?.status === "verified";
  const showEmail = Boolean(email);

  return (
    <section className={cn("glass rounded-[1.75rem] p-5 sm:p-7", className)}>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Verification</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
          Identity & process
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Only verified states backed by real data are shown as Verified.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {showEmail ? (
          <li className="rounded-[1.35rem] bg-muted/50 px-4 py-4 ring-1 ring-border/50">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Mail className="size-4" />
              </span>
              <StatusBadge tone={emailVerified ? "success" : "neutral"}>
                {emailVerified ? "Verified" : "Unverified"}
              </StatusBadge>
            </div>
            <p className="mt-3 font-semibold text-foreground">Email</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {emailVerified ? "Confirmed via Supabase Auth" : "Confirm your email to verify"}
            </p>
            {emailVerified ? <BadgeCheck className="mt-2 size-4 text-success" /> : null}
          </li>
        ) : null}

        {comingSoon.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.key}
              className="rounded-[1.35rem] bg-muted/40 px-4 py-4 ring-1 ring-border/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <StatusBadge tone="neutral">Coming soon</StatusBadge>
              </div>
              <p className="mt-3 font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
