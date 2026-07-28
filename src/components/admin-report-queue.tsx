"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminReport } from "@/lib/types";

export function AdminReportQueue({ reports }: { reports: AdminReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Report queue</h2>
        <p className="mt-2 text-slate-600">No reports are waiting for review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
    const payload = await response.json();

    setLoading(false);
    setMessage(response.ok ? `Report ${status}.` : payload.error ?? "Unable to review report.");

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <article className="glass-card rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Evidence report</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">{report.title}</h3>
          <p className="mt-2 text-slate-700">{report.description}</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
          {report.status}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-4">
          <dt className="font-bold text-slate-500">Reporter</dt>
          <dd className="mt-1 text-slate-900">
            {report.reporter?.full_name} · {report.reporter?.trueverse_id}
          </dd>
        </div>
        <div className="rounded-2xl bg-white/80 p-4">
          <dt className="font-bold text-slate-500">Reported user</dt>
          <dd className="mt-1 text-slate-900">
            {report.reported_user?.full_name} · {report.reported_user?.trueverse_id}
          </dd>
        </div>
      </dl>

      <a
        href={report.evidence_url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex font-bold text-teal-700 hover:text-teal-900"
      >
        Open evidence
      </a>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Admin review notes"
        className="mt-5 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
      />

      {message ? <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          disabled={loading}
          onClick={() => review("approved")}
          className="rounded-2xl bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          Approve -5
        </button>
        <button
          disabled={loading}
          onClick={() => review("rejected")}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Reject
        </button>
        <button
          disabled={loading}
          onClick={() => review("disputed")}
          className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:border-teal-500 disabled:opacity-60"
        >
          Mark disputed
        </button>
      </div>
    </article>
  );
}
