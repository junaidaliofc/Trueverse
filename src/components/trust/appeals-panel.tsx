"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AppealRow } from "@/lib/trust-os";
import { RelativeTime } from "@/components/ui/relative-time";

export function AppealsPanel({
  appeals,
  local = false
}: {
  appeals: AppealRow[];
  local?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [targetTable, setTargetTable] = useState<
    "positive_interactions" | "negative_reports" | "community_reports"
  >("negative_reports");
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Trust OS</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Appeals</h1>
        <p className="mt-2 text-sm leading-6 text-foreground/80">
          Every moderation decision can be appealed. History stays visible: pending, under review,
          accepted, or rejected.
        </p>
      </header>

      <section className="glass-elevated rounded-[1.6rem] p-5">
        <Label htmlFor="appeal-target">Decision to appeal</Label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <select
            id="appeal-target"
            className="h-11 rounded-2xl border border-border bg-background px-3 text-sm"
            value={targetTable}
            onChange={(event) =>
              setTargetTable(
                event.target.value as
                  | "positive_interactions"
                  | "negative_reports"
                  | "community_reports"
              )
            }
          >
            <option value="negative_reports">Negative report</option>
            <option value="positive_interactions">Trust Act review</option>
            <option value="community_reports">Community report</option>
          </select>
          <input
            value={targetId}
            onChange={(event) => setTargetId(event.target.value.trim())}
            placeholder="Decision ID (UUID)"
            className="h-11 rounded-2xl border border-border bg-background px-3 text-sm"
            autoComplete="off"
          />
        </div>
        <Label htmlFor="appeal-reason" className="mt-4">
          New appeal
        </Label>
        <Textarea
          id="appeal-reason"
          className="mt-2"
          value={reason}
          onChange={(event) => setReason(event.target.value.slice(0, 1600))}
          placeholder="Explain what should be reconsidered. This does not change Trust by itself."
        />
        {message ? <p className="mt-2 text-sm text-foreground/80">{message}</p> : null}
        <Button
          type="button"
          className="mt-4"
          disabled={pending || reason.trim().length < 12 || (!local && targetId.length < 32)}
          onClick={() => {
            if (local) {
              setMessage("Preview only. Live appeals store in moderation_appeals.");
              return;
            }
            startTransition(async () => {
              const response = await fetch("/api/appeals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  target_table: targetTable,
                  target_id: targetId,
                  reason
                })
              });
              const payload = (await response.json()) as { error?: string };
              setMessage(response.ok ? "Appeal submitted." : payload.error ?? "Unable to appeal.");
              if (response.ok) setReason("");
            });
          }}
        >
          Submit appeal
        </Button>
      </section>

      {appeals.length === 0 ? (
        <div className="glass-elevated rounded-[1.6rem] px-5 py-10 text-center">
          <p className="font-display text-lg font-bold">No appeals yet</p>
          <p className="mt-2 text-sm text-foreground/80">When you appeal a decision, it will list here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {appeals.map((item) => (
            <li key={item.id} className="glass-elevated rounded-[1.5rem] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.status}</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{item.reason}</p>
              <p className="mt-2 text-xs text-foreground/70">
                {item.target_table} · <RelativeTime iso={item.created_at} />
              </p>
              {item.resolution_notes ? (
                <p className="mt-2 text-sm text-foreground/80">{item.resolution_notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
