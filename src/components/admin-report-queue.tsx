"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminReportQueue({ reports }: { reports: AdminReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="glass-elevated rounded-[1.75rem] px-6 py-12 text-center">
        <p className="font-display text-lg font-bold text-foreground">No reports waiting</p>
        <p className="mt-2 text-sm text-foreground/80">
          Evidence review is empty. Rejected reports never change Trust.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/80">
        Pending → evidence review → approve (penalty) or reject (nothing changes).
      </p>
      {reports.map((report) => (
        <AdminReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

function AdminReportCard({ report }: { report: AdminReport }) {
  const router = useRouter();
  const [notes, setNotes] = useState(report.admin_notes ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function review(status: "approved" | "rejected" | "disputed") {
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/admin/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_notes: notes })
    });
    const payload = (await response.json()) as { error?: string };
    setLoading(false);
    setMessage(response.ok ? `Report ${status}.` : payload.error ?? "Unable to review report.");
    if (response.ok) router.refresh();
  }

  return (
    <article className="glass-elevated rounded-[1.5rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Evidence report</p>
          <h3 className="mt-1 font-display text-xl font-bold text-foreground">{report.title}</h3>
          <p className="mt-2 text-sm leading-6 text-foreground/80">{report.description}</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize text-foreground">
          {report.status}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-muted/50 p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/70">Reporter</dt>
          <dd className="mt-1 font-medium">
            {report.reporter?.full_name} · {report.reporter?.trueverse_id}
          </dd>
        </div>
        <div className="rounded-2xl bg-muted/50 p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/70">Reported</dt>
          <dd className="mt-1 font-medium">
            {report.reported_user?.full_name} · {report.reported_user?.trueverse_id}
          </dd>
        </div>
      </dl>

      {report.evidence_url ? (
        <a
          href={report.evidence_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          Open evidence
        </a>
      ) : null}

      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Review notes — stored on the audit log"
        className="mt-4"
      />

      {message ? <p className="mt-3 text-sm text-foreground/80">{message}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={loading} onClick={() => review("approved")}>
          Approve — penalty applied
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => review("rejected")}>
          Reject — nothing changes
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={loading} onClick={() => review("disputed")}>
          Mark disputed
        </Button>
      </div>
    </article>
  );
}
