"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REFERENCE_RELATIONSHIPS } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const RELATIONSHIP_LABELS: Record<(typeof REFERENCE_RELATIONSHIPS)[number], string> = {
  worked_together: "Worked together",
  bought_sold: "Bought / sold something",
  professional: "Professional relationship",
  community: "Community",
  other: "Other"
};

const SIGNALS = [
  { name: "reliable", label: "Reliable" },
  { name: "communicated_clearly", label: "Communicated clearly" },
  { name: "followed_through", label: "Followed through" },
  { name: "would_interact_again", label: "Would interact again" }
] as const;

const fieldClass =
  "h-11 w-full rounded-2xl border border-input bg-transparent px-3.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ReferenceForm({
  subjectTrueverseId,
  subjectName
}: {
  subjectTrueverseId: string;
  subjectName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ loading: boolean; ok: boolean; message: string }>({
    loading: false,
    ok: false,
    message: ""
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ loading: true, ok: false, message: "" });

    const body = {
      subject_trueverse_id: subjectTrueverseId,
      relationship: String(data.get("relationship") ?? "other"),
      reliable: data.get("reliable") === "on",
      communicated_clearly: data.get("communicated_clearly") === "on",
      followed_through: data.get("followed_through") === "on",
      would_interact_again: data.get("would_interact_again") === "on",
      note: String(data.get("note") ?? "")
    };

    const response = await fetch("/api/references", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    setState({
      loading: false,
      ok: response.ok,
      message: response.ok
        ? "Reference saved. Thank you for adding real context."
        : payload.error ?? "Unable to save reference."
    });

    if (response.ok) {
      router.refresh();
    }
  }

  if (!open) {
    return (
      <section className="glass rounded-[1.75rem] p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight">Leave a Reference</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add structured context from a real interaction with {subjectName}. References are not a
          numeric score, and you can leave one per person.
        </p>
        <Button className="mt-4" onClick={() => setOpen(true)}>
          Leave a Reference
        </Button>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-[1.75rem] p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">Leave a Reference</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For {subjectName}. This adds context, not a trust score.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="relationship">Relationship</Label>
        <select id="relationship" name="relationship" defaultValue="other" className={fieldClass}>
          {REFERENCE_RELATIONSHIPS.map((value) => (
            <option key={value} value={value}>
              {RELATIONSHIP_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Signals</legend>
        <div className="grid grid-cols-2 gap-2">
          {SIGNALS.map((signal) => (
            <label
              key={signal.name}
              className="flex items-center gap-2 rounded-2xl border border-input px-3 py-2.5 text-sm"
            >
              <input type="checkbox" name={signal.name} className="size-4 accent-primary" />
              {signal.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          name="note"
          maxLength={500}
          placeholder="A short, factual note about your interaction."
          className="min-h-24 rounded-2xl"
        />
      </div>

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-2xl bg-success-soft px-4 py-3 text-sm text-success"
              : "rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={state.loading}>
          {state.loading ? "Saving…" : "Save Reference"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
