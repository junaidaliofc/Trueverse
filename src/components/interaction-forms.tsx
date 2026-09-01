"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INTERACTION_CATEGORIES } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ApiState = {
  loading: boolean;
  ok: boolean;
  message: string;
};

const initialState: ApiState = { loading: false, ok: false, message: "" };

const CATEGORY_LABELS: Record<(typeof INTERACTION_CATEGORIES)[number], string> = {
  marketplace: "Marketplace",
  professional: "Professional",
  service: "Service",
  community: "Community",
  other: "Other"
};

const fieldClass =
  "h-11 w-full rounded-2xl border border-input bg-transparent px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function PositiveInteractionForm({
  defaultRecipient
}: {
  defaultRecipient?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ loading: true, ok: false, message: "" });

    const response = await fetch("/api/interactions/positive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(data))
    });

    const payload = await response.json().catch(() => ({}));
    setState({
      loading: false,
      ok: response.ok,
      message: response.ok
        ? "Interaction sent. It becomes a Verified Interaction once the other person confirms it occurred."
        : payload.error ?? "Unable to start interaction."
    });

    if (response.ok) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-[1.75rem] p-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Interaction</p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">Start an Interaction</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a real interaction with another member. It stays pending until they confirm it.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recipient_trueverse_id">Other member (username or Trueverse ID)</Label>
        <Input
          id="recipient_trueverse_id"
          name="recipient_trueverse_id"
          defaultValue={defaultRecipient}
          placeholder="username or tv_..."
          required
          className="h-11 rounded-2xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select id="category" name="category" defaultValue="other" className={fieldClass}>
          {INTERACTION_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Sold a bike, on time and as described"
          required
          className="h-11 rounded-2xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">What happened?</Label>
        <Textarea id="description" name="description" required className="min-h-28 rounded-2xl" />
      </div>

      <FormMessage state={state} />

      <Button type="submit" disabled={state.loading} className="w-full">
        {state.loading ? "Sending…" : "Start Interaction"}
      </Button>
    </form>
  );
}

export function NegativeReportForm() {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ loading: true, ok: false, message: "" });

    const response = await fetch("/api/interactions/negative", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(data))
    });

    const payload = await response.json().catch(() => ({}));
    setState({
      loading: false,
      ok: response.ok,
      message: response.ok
        ? "Report sent to moderation for review. It is private and does not change anyone's reputation."
        : payload.error ?? "Unable to submit report."
    });

    if (response.ok) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-[1.75rem] p-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Private &amp; moderated
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">Report a Concern</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Reports go to moderation review. They are not public, are not accusations, and do not
          automatically change anyone&rsquo;s reputation.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reported_trueverse_id">Member (username or Trueverse ID)</Label>
        <Input
          id="reported_trueverse_id"
          name="reported_trueverse_id"
          placeholder="username or tv_..."
          required
          className="h-11 rounded-2xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="report_title">Title</Label>
        <Input
          id="report_title"
          name="title"
          placeholder="Short summary"
          required
          className="h-11 rounded-2xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="evidence_url">Evidence URL</Label>
        <Input
          id="evidence_url"
          name="evidence_url"
          type="url"
          placeholder="https://..."
          required
          className="h-11 rounded-2xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="report_description">Describe the concern and evidence</Label>
        <Textarea
          id="report_description"
          name="description"
          required
          className="min-h-28 rounded-2xl"
        />
      </div>

      <FormMessage state={state} />

      <Button type="submit" variant="outline" disabled={state.loading} className="w-full">
        {state.loading ? "Submitting…" : "Submit to moderation"}
      </Button>
    </form>
  );
}

function FormMessage({ state }: { state: ApiState }) {
  if (!state.message) return null;
  return (
    <p
      className={
        state.ok
          ? "rounded-2xl bg-success-soft px-4 py-3 text-sm text-success"
          : "rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground"
      }
    >
      {state.message}
    </p>
  );
}
