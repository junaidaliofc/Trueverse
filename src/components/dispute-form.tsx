"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DisputeForm({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId, reason })
    });
    const payload = await response.json().catch(() => ({}));

    setLoading(false);
    setMessage(response.ok ? "Dispute submitted for admin review." : payload.error ?? "Unable to submit dispute.");

    if (response.ok) {
      setReason("");
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <div className="mt-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-teal-500"
        >
          Dispute this report
        </button>
        {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3">
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Explain why this report is inaccurate (min 10 characters)."
        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
        required
        minLength={10}
      />
      {message ? <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
      <div className="flex gap-3">
        <button
          disabled={loading}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit dispute"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:border-teal-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
