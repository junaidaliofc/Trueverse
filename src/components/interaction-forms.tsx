"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiState = {
  loading: boolean;
  message: string;
};

const initialState: ApiState = {
  loading: false,
  message: ""
};

export function PositiveInteractionForm() {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ loading: true, message: "" });

    const response = await fetch("/api/interactions/positive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });

    const payload = await response.json();
    setState({
      loading: false,
      message: response.ok
        ? "Positive interaction sent. The recipient must accept it before trust score changes."
        : payload.error ?? "Unable to submit interaction."
    });

    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-4 rounded-3xl p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Positive interaction</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Recognize someone helpful</h2>
      </div>
      <Input name="recipient_trueverse_id" label="Recipient Trueverse ID" placeholder="tv_..." />
      <Input name="title" label="Title" placeholder="Helped with a ride" />
      <Textarea name="description" label="What happened?" />
      <FormMessage state={state} />
      <button className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700 disabled:opacity-60">
        {state.loading ? "Submitting..." : "Submit for acceptance"}
      </button>
    </form>
  );
}

export function NegativeReportForm() {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ loading: true, message: "" });

    const response = await fetch("/api/interactions/negative", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });

    const payload = await response.json();
    setState({
      loading: false,
      message: response.ok
        ? "Report submitted for admin review. No score change occurs until approval."
        : payload.error ?? "Unable to submit report."
    });

    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-4 rounded-3xl p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Negative interaction</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Submit an evidence-backed report</h2>
      </div>
      <Input name="reported_trueverse_id" label="Reported user Trueverse ID" placeholder="tv_..." />
      <Input name="title" label="Title" placeholder="Missed agreed commitment" />
      <Input name="evidence_url" label="Evidence URL" placeholder="https://..." />
      <Textarea name="description" label="Describe the incident and evidence" />
      <FormMessage state={state} />
      <button className="rounded-2xl bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-700 disabled:opacity-60">
        {state.loading ? "Submitting..." : "Submit for admin review"}
      </button>
    </form>
  );
}

function Input({
  name,
  label,
  placeholder
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
        required
      />
    </label>
  );
}

function Textarea({ name, label }: { name: string; label: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <textarea
        name={name}
        className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
        required
      />
    </label>
  );
}

function FormMessage({ state }: { state: ApiState }) {
  if (!state.message) {
    return null;
  }

  return <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{state.message}</p>;
}
