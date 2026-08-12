"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ApiState = {
  loading: boolean;
  message: string;
  ok?: boolean;
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
      ok: response.ok,
      message: response.ok
        ? "Positive interaction sent. The recipient must accept it before trust changes."
        : payload.error ?? "Unable to submit interaction."
    });

    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-3xl p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Positive interaction
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
          Recognize someone helpful
        </h2>
      </div>
      <Field name="recipient_trueverse_id" label="Recipient username or Trueverse ID" placeholder="username" />
      <Field name="title" label="Title" placeholder="Helped with a ride" />
      <Area name="description" label="What happened?" />
      <FormMessage state={state} />
      <Button type="submit" disabled={state.loading} className="w-full sm:w-auto">
        {state.loading ? "Submitting..." : "Submit for acceptance"}
      </Button>
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
      ok: response.ok,
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
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-3xl p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-danger">
          Negative interaction
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
          Submit an evidence-backed report
        </h2>
      </div>
      <Field name="reported_trueverse_id" label="Reported username or Trueverse ID" placeholder="username" />
      <Field name="title" label="Title" placeholder="Missed agreed commitment" />
      <Field name="evidence_url" label="Evidence URL" placeholder="https://" />
      <Area name="description" label="Describe the incident and evidence" />
      <FormMessage state={state} />
      <Button type="submit" variant="destructive" disabled={state.loading} className="w-full sm:w-auto">
        {state.loading ? "Submitting..." : "Submit for admin review"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} required className="h-11 rounded-2xl" />
    </div>
  );
}

function Area({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} required className="min-h-32 rounded-2xl" />
    </div>
  );
}

function FormMessage({ state }: { state: ApiState }) {
  if (!state.message) return null;
  return (
    <p
      className={
        state.ok
          ? "rounded-2xl bg-success-soft p-3 text-sm text-success"
          : "rounded-2xl bg-muted p-3 text-sm text-foreground"
      }
    >
      {state.message}
    </p>
  );
}
