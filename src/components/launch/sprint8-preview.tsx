"use client";

import Link from "next/link";
import { AdminTrustOsDashboard } from "@/components/admin/trust-os-dashboard";
import { AppealsPanel } from "@/components/trust/appeals-panel";
import { FeedbackFab } from "@/components/feedback/feedback-fab";
import { ProfileCompletionCard } from "@/components/onboarding/profile-completion-card";
import { PassportBadgeBoard } from "@/components/passport/passport-badge-board";
import { buildProfileCompletion } from "@/lib/profile-completion";
import { PASSPORT_MOCK_BADGES } from "@/lib/passport-mock";
import { adminReports } from "@/lib/dummy-data";
import {
  mockAppeals,
  mockAuditLog,
  mockBetaAnalytics,
  mockCommunityReports,
  mockFlaggedAccounts,
  mockPendingTrustActs
} from "@/lib/trust-os-mock";
import { IDENTITY_ARCHITECTURE, LAUNCH_CHECKLIST } from "@/lib/trust-os";
import { Check } from "lucide-react";

const health = buildProfileCompletion({
  email: true,
  photo: true,
  bio: true,
  location: false,
  skills: true,
  communities: true,
  trustAct: false
});

export function Sprint8Preview() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 py-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Sprint 8 preview
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Trust OS + public beta
        </h1>
        <p className="text-sm leading-6 text-foreground/80">
          Trust is earned from verified help. It is never manufactured by likes, badges, or
          popularity. This preview uses local mock queues — no live Trust changes.
        </p>
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <Link href="/trust" className="text-primary hover:underline">
            Trust principles
          </Link>
          <Link href="/launch" className="text-primary hover:underline">
            Launch readiness
          </Link>
          <Link href="/appeals" className="text-primary hover:underline">
            Appeals
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Admin moderation</h2>
        <AdminTrustOsDashboard
          acts={mockPendingTrustActs}
          reports={adminReports}
          communityReports={mockCommunityReports}
          flagged={mockFlaggedAccounts}
          appeals={mockAppeals}
          audit={mockAuditLog}
          analytics={mockBetaAnalytics}
          local
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Member appeals</h2>
        <AppealsPanel appeals={mockAppeals} local />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Profile health</h2>
          <ProfileCompletionCard completion={health} />
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Launch checklist</h2>
          <ul className="space-y-2">
            {LAUNCH_CHECKLIST.map((item) => (
              <li
                key={item.id}
                className="glass-elevated flex items-center gap-3 rounded-[1.2rem] px-4 py-3"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="font-semibold">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Trust badges</h2>
        <p className="text-sm text-foreground/80">
          Recognition only. Unlocking a badge never changes Trust Score.
        </p>
        <PassportBadgeBoard badges={PASSPORT_MOCK_BADGES} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">One person → one reputation</h2>
        <p className="text-sm leading-6 text-foreground/80">
          Architecture is prepared. None of these checks are required to use Trueverse today.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {IDENTITY_ARCHITECTURE.map((item) => (
            <li key={item.id} className="glass-elevated rounded-[1.4rem] p-4">
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-foreground/80">{item.note}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
                Prepared · not required
              </p>
            </li>
          ))}
        </ul>
      </section>

      <FeedbackFab local />
    </div>
  );
}
