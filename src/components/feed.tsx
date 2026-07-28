"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HelpRequest } from "@/lib/types";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export function FeedComposer() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const payload = await response.json();

    setLoading(false);
    setMessage(response.ok ? "Help request published." : payload.error ?? "Unable to publish request.");

    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-4 rounded-3xl p-6">
      <h2 className="text-2xl font-black text-slate-950">Ask the community for help</h2>
      <input
        name="title"
        placeholder="What do you need?"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
        required
      />
      <input
        name="location"
        placeholder="Location (optional)"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
      />
      <textarea
        name="description"
        placeholder="Add details so trusted community members can respond."
        className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
        required
      />
      {message ? <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
      <button className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60">
        {loading ? "Publishing..." : "Publish request"}
      </button>
    </form>
  );
}

const STATUS_STYLES: Record<HelpRequest["status"], string> = {
  open: "bg-teal-100 text-teal-800",
  accepted: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-600"
};

export function HelpRequestCard({
  request,
  viewerId
}: {
  request: HelpRequest;
  viewerId?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthor = Boolean(viewerId) && viewerId === request.author_id;
  const isHelper = Boolean(viewerId) && viewerId === request.helper_id;

  async function runAction(path: string) {
    setLoading(true);
    setActionMessage("");

    const response = await fetch(path, { method: "POST" });
    const payload = await response.json().catch(() => ({}));

    setLoading(false);
    if (response.ok) {
      router.refresh();
    } else {
      setActionMessage(payload.error ?? "Action failed.");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch(`/api/feed/${request.id}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const payload = await response.json();

    setMessage(response.ok ? "Response added." : payload.error ?? "Unable to respond.");

    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <article className="glass-card rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-950">{request.title}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLES[request.status]}`}>
              {request.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {request.profiles?.full_name || "Community member"} · {request.location || "Remote"}
          </p>
        </div>
        {request.profiles ? <TrustScoreBadge score={request.profiles.trust_score} /> : null}
      </div>

      <p className="mt-4 text-slate-700">{request.description}</p>

      {request.helper ? (
        <p className="mt-3 text-sm font-semibold text-slate-600">
          {request.status === "completed" ? "Completed by" : "Being helped by"}{" "}
          {request.helper.full_name || "a member"} · {request.helper.trueverse_id}
          {request.status === "completed" ? " · helper earned +3 trust" : ""}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {request.status === "open" && viewerId && !isAuthor ? (
          <button
            disabled={loading}
            onClick={() => runAction(`/api/feed/${request.id}/accept`)}
            className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            Accept request
          </button>
        ) : null}

        {request.status === "accepted" && isAuthor ? (
          <button
            disabled={loading}
            onClick={() => runAction(`/api/feed/${request.id}/complete`)}
            className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Mark completed
          </button>
        ) : null}

        {request.status === "accepted" && isHelper ? (
          <p className="text-sm font-semibold text-amber-700">
            You accepted this — awaiting the requester&apos;s confirmation.
          </p>
        ) : null}

        {request.status === "open" && isAuthor ? (
          <p className="text-sm text-slate-500">Waiting for a member to accept your request.</p>
        ) : null}
      </div>
      {actionMessage ? (
        <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{actionMessage}</p>
      ) : null}

      <div className="mt-5 space-y-3">
        {(request.community_responses ?? []).map((response) => (
          <div key={response.id} className="rounded-2xl bg-white/80 p-4">
            <p className="text-sm text-slate-700">{response.message}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {response.profiles?.full_name || "Member"} · {response.profiles?.trueverse_id}
            </p>
          </div>
        ))}
      </div>

      {viewerId ? (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            name="message"
            placeholder="Offer help or ask a clarifying question"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
            required
          />
          <button className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700">
            Respond
          </button>
        </form>
      ) : null}
      {message ? <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
    </article>
  );
}
