"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RelativeTime } from "@/components/ui/relative-time";
import { chipClass } from "@/lib/ui";

import {
  ADMIN_TABS,
  reporterAccuracyLabel,
  type AdminTab,
  type AppealRow,
  type BetaAnalytics,
  type CommunityReportRow,
  type FlaggedAccountRow,
  type ModerationAuditRow,
  type TrustActReviewRow
} from "@/lib/trust-os";
import type { AdminReport } from "@/lib/types";
import { AdminReportQueue } from "@/components/admin-report-queue";

export function AdminTrustOsDashboard({
  acts,
  reports,
  communityReports,
  flagged,
  appeals,
  audit,
  analytics,
  local = false
}: {
  acts: TrustActReviewRow[];
  reports: AdminReport[];
  communityReports: CommunityReportRow[];
  flagged: FlaggedAccountRow[];
  appeals: AppealRow[];
  audit: ModerationAuditRow[];
  analytics: BetaAnalytics;
  local?: boolean;
}) {
  const [tab, setTab] = useState<AdminTab>("acts");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Trust OS</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Moderation
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/80">
          Trust is earned from verified help. Approve only what is real. Rejected reports never
          change Trust Score.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {ADMIN_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={chipClass(tab === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "acts" ? <TrustActQueue items={acts} local={local} /> : null}
      {tab === "reports" ? <AdminReportQueue reports={reports} /> : null}
      {tab === "community" ? <CommunityReportQueue items={communityReports} local={local} /> : null}
      {tab === "flagged" ? <FlaggedList items={flagged} local={local} /> : null}
      {tab === "appeals" ? <AppealQueue items={appeals} local={local} /> : null}
      {tab === "audit" ? <AuditList items={audit} /> : null}
      {tab === "analytics" ? <AnalyticsCard analytics={analytics} /> : null}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-elevated rounded-[1.75rem] px-6 py-12 text-center">
      <p className="font-display text-lg font-bold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-foreground/80">{body}</p>
    </div>
  );
}

function TrustActQueue({ items, local }: { items: TrustActReviewRow[]; local: boolean }) {
  const pendingRecipient = items.filter((item) => item.status === "pending");
  const review = items.filter((item) => item.status === "accepted" && item.admin_status === "pending");

  if (!items.length) {
    return <EmptyState title="No Trust Acts waiting" body="Pending and review queues are clear." />;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Pending</h2>
        <p className="text-sm text-foreground/80">Waiting for the recipient to confirm. No Trust yet.</p>
        {pendingRecipient.length === 0 ? (
          <p className="text-sm text-foreground/75">None.</p>
        ) : (
          pendingRecipient.map((item) => <ActCard key={item.id} item={item} />)
        )}
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Review</h2>
        <p className="text-sm text-foreground/80">
          Recipient confirmed. Approve to update Trust. Reject leaves Trust unchanged.
        </p>
        {review.length === 0 ? (
          <p className="text-sm text-foreground/75">None.</p>
        ) : (
          review.map((item) => <ActCard key={item.id} item={item} review local={local} />)
        )}
      </section>
    </div>
  );
}

function ActCard({
  item,
  review = false,
  local = false
}: {
  item: TrustActReviewRow;
  review?: boolean;
  local?: boolean;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function decide(status: "approved" | "rejected") {
    setMessage(local ? `Local preview: ${status}. Trust changes only on approve in production.` : "");
    if (local) return;
    startTransition(async () => {
      const response = await fetch(`/api/admin/trust-acts/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes })
      });
      const payload = (await response.json()) as { error?: string };
      setMessage(response.ok ? `Trust Act ${status}.` : payload.error ?? "Unable to review.");
      if (response.ok) router.refresh();
    });
  }

  return (
    <article className="glass-elevated rounded-[1.5rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
          <p className="mt-1 text-sm leading-6 text-foreground/80">{item.description}</p>
          <p className="mt-2 text-xs text-foreground/70">
            {item.author_name} → {item.recipient_name} · <RelativeTime iso={item.created_at} />
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize">
          {item.admin_status ?? item.status}
        </span>
      </div>
      {review ? (
        <div className="mt-4 space-y-3">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Reason (stored in the audit log)"
          />
          {message ? <p className="text-sm text-foreground/80">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={pending} onClick={() => decide("approved")}>
              Approve — Trust updates
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => decide("rejected")}>
              Reject — no Trust change
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function CommunityReportQueue({
  items,
  local
}: {
  items: CommunityReportRow[];
  local: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!items.length) {
    return <EmptyState title="No community reports" body="Feed reports will appear here." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="glass-elevated rounded-[1.5rem] p-5">
          <p className="text-sm leading-6 text-foreground">{item.body}</p>
          <p className="mt-2 text-xs text-foreground/70">
            {item.reporter_name} · {item.status} · <RelativeTime iso={item.created_at} />
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="xs"
              disabled={pending}
              onClick={() => {
                if (local) return;
                startTransition(async () => {
                  await fetch(`/api/admin/community-reports/${item.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "approved" })
                  });
                  router.refresh();
                });
              }}
            >
              Uphold
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={pending}
              onClick={() => {
                if (local) return;
                startTransition(async () => {
                  await fetch(`/api/admin/community-reports/${item.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "rejected" })
                  });
                  router.refresh();
                });
              }}
            >
              Dismiss
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FlaggedList({ items, local }: { items: FlaggedAccountRow[]; local: boolean }) {
  if (!items.length) {
    return <EmptyState title="No flagged accounts" body="Cooldowns and flags will list here." />;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="glass-elevated rounded-[1.5rem] p-5">
          <p className="font-semibold text-foreground">{item.full_name}</p>
          <p className="font-mono text-[11px] text-foreground/70">{item.trueverse_id}</p>
          <p className="mt-2 text-sm text-foreground/80">{item.flag_reason ?? "Flagged for review"}</p>
          <p className="mt-1 text-xs text-foreground/70">
            {reporterAccuracyLabel(item.reporter_accuracy)}
            {item.reporting_suspended ? " · reporting suspended" : ""}
            {item.is_disabled ? " · account disabled" : ""}
          </p>
          {local ? (
            <p className="mt-3 text-xs text-foreground/70">Preview only — no live flag action.</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function AppealQueue({ items, local }: { items: AppealRow[]; local: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!items.length) {
    return <EmptyState title="No appeals" body="Members can appeal any moderation decision." />;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="glass-elevated rounded-[1.5rem] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.status}</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{item.reason}</p>
          <p className="mt-2 text-xs text-foreground/70">
            {item.target_table} · <RelativeTime iso={item.created_at} />
          </p>
          {item.resolution_notes ? (
            <p className="mt-2 text-sm text-foreground/80">{item.resolution_notes}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {(["under_review", "accepted", "rejected"] as const).map((status) => (
              <Button
                key={status}
                type="button"
                size="xs"
                variant={status === "accepted" ? "default" : "outline"}
                disabled={pending}
                onClick={() => {
                  if (local) return;
                  startTransition(async () => {
                    await fetch(`/api/admin/appeals/${item.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status })
                    });
                    router.refresh();
                  });
                }}
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function AuditList({ items }: { items: ModerationAuditRow[] }) {
  if (!items.length) {
    return <EmptyState title="Audit log is empty" body="Every approve, reject, and flag is recorded." />;
  }
  return (
    <div className="overflow-x-auto rounded-[1.5rem] ring-1 ring-border/60">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted/60 text-xs font-bold uppercase tracking-wide text-foreground/75">
          <tr>
            <th className="px-4 py-3">Admin</th>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Affected</th>
            <th className="px-4 py-3">Previous</th>
            <th className="px-4 py-3">New</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-t border-border/50">
              <td className="px-4 py-3 font-medium">{row.admin_name}</td>
              <td className="px-4 py-3 text-foreground/75">
                <RelativeTime iso={row.created_at} />
              </td>
              <td className="px-4 py-3">{row.action}</td>
              <td className="max-w-xs px-4 py-3 text-foreground/80">{row.reason ?? "—"}</td>
              <td className="px-4 py-3">{row.affected_name ?? "—"}</td>
              <td className="px-4 py-3 capitalize">{row.previous_status ?? "—"}</td>
              <td className="px-4 py-3 capitalize">{row.new_status ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsCard({ analytics }: { analytics: BetaAnalytics }) {
  const stats = [
    { label: "Members", value: analytics.members },
    { label: "Trust Acts in review", value: analytics.pending_trust_acts },
    { label: "Reports in review", value: analytics.pending_reports },
    { label: "Appeals", value: analytics.pending_appeals },
    { label: "Feedback notes", value: analytics.feedback }
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((item) => (
        <li key={item.label} className="glass-elevated rounded-[1.5rem] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.label}</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{item.value}</p>
        </li>
      ))}
    </ul>
  );
}
