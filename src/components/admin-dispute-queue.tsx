"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminDispute } from "@/lib/types";

export function AdminDisputeQueue({ disputes }: { disputes: AdminDispute[] }) {
  if (disputes.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Disputes</h2>
        <p className="mt-2 text-slate-600">No open disputes to review.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <h2 className="text-2xl font-black text-slate-950">Disputes</h2>
      <div className="mt-5 space-y-5">
        {disputes.map((dispute) => (
          <AdminDisputeCard key={dispute.id} dispute={dispute} />
        ))}
      </div>
    </div>
  );
}

function AdminDisputeCard({ dispute }: { dispute: AdminDispute }) {
  const router = useRouter();
  const [notes, setNotes] = useState(dispute.resolution_notes ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function resolve(status: "resolved" | "rejected") {
    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/admin/disputes/${dispute.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolution_notes: notes, restore_score: status === "resolved" })
    });
    const payload = await response.json().catch(() => ({}));

    setLoading(false);
    setMessage(response.ok ? `Dispute ${status}.` : payload.error ?? "Unable to resolve dispute.");

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <article className="rounded-2xl bg-white/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Dispute</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {dispute.report?.title ?? "Report"}
          </h3>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-800">
          {dispute.status}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        <span className="font-bold">Dispute reason:</span> {dispute.reason}
      </p>
      {dispute.report ? (
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-bold">Report:</span> {dispute.report.description}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-slate-600">
        <span className="font-bold">Opened by:</span> {dispute.opener?.full_name || "Member"} ·{" "}
        {dispute.opener?.trueverse_id}
      </p>
      {dispute.report?.evidence_url ? (
        <a
          href={dispute.report.evidence_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-sm font-bold text-teal-700 hover:text-teal-900"
        >
          Open evidence
        </a>
      ) : null}

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Resolution notes"
        className="mt-4 min-h-20 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
      />

      {message ? <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          disabled={loading}
          onClick={() => resolve("resolved")}
          className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Uphold &amp; restore score
        </button>
        <button
          disabled={loading}
          onClick={() => resolve("rejected")}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Reject dispute
        </button>
      </div>
    </article>
  );
}
