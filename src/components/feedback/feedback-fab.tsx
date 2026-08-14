"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/lib/trust-os";

export function FeedbackFab({ local = false }: { local?: boolean }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("suggestion");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (local) {
      setBody("");
      setMessage("Preview only. Live feedback stores in beta_feedback.");
      return;
    }
    startTransition(async () => {
      setMessage("");
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, body })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Unable to send feedback.");
        return;
      }
      setBody("");
      setMessage("Thank you. The beta team will read this.");
    });
  }

  return (
    <>
      <Button
        type="button"
        className="fixed bottom-20 right-4 z-40 shadow-lg sm:bottom-6"
        onClick={() => setOpen(true)}
      >
        <MessageSquarePlus className="size-4" />
        Send Feedback
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            aria-label="Close feedback"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-labelledby="feedback-title"
            className="glass-elevated relative z-10 w-full max-w-md rounded-[1.75rem] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Beta</p>
                <h2 id="feedback-title" className="mt-1 font-display text-xl font-bold">
                  Send Feedback
                </h2>
              </div>
              <Button type="button" size="icon-sm" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {FEEDBACK_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={
                    category === item.id
                      ? "rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                      : "rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground/80"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Label htmlFor="feedback-body" className="mt-4">
              What should we know?
            </Label>
            <Textarea
              id="feedback-body"
              className="mt-2"
              value={body}
              onChange={(event) => setBody(event.target.value.slice(0, 2000))}
              placeholder="A bug, a suggestion, a feature, or a confusing screen."
            />
            {message ? <p className="mt-3 text-sm text-foreground/80">{message}</p> : null}
            <Button type="button" className="mt-4" disabled={pending || body.trim().length < 8} onClick={submit}>
              Send
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
