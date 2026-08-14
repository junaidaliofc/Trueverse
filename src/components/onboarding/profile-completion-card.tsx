"use client";

import Link from "next/link";
import { CircleCheck, Sparkles } from "lucide-react";
import { LabeledProgress } from "@/components/ui/progress-field";
import { Button } from "@/components/ui/button";
import type { ProfileCompletion } from "@/lib/profile-completion";
import { cn } from "@/lib/utils";

export function ProfileCompletionCard({ completion }: { completion: ProfileCompletion }) {
  return (
    <section className="glass-elevated rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Profile completion
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
            {completion.complete ? "You're all set" : "Finish your Passport"}
          </h2>
        </div>
        <span className="font-display text-2xl font-bold tabular-nums text-primary">
          {completion.percent}%
        </span>
      </div>

      <LabeledProgress
        className="mt-4"
        value={completion.percent}
        label="Progress"
        indicatorClassName="bg-primary"
      />

      {completion.complete ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">
          <Sparkles className="size-5 shrink-0" />
          <p className="font-semibold">Passport complete. Welcome to the neighborhood.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {completion.tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={task.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-2 py-2 text-sm hover:bg-muted/60",
                  task.done && "text-muted-foreground"
                )}
              >
                {task.done ? (
                  <CircleCheck className="size-4 shrink-0 text-success" />
                ) : (
                  <span className="size-4 shrink-0 rounded-full ring-2 ring-border" />
                )}
                <span className={cn("font-medium", task.done && "line-through")}>
                  {task.label}
                  {task.optional ? (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
                      Optional
                    </span>
                  ) : null}
                  {task.future ? (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
                      Future
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!completion.complete ? (
        <Button asChild className="mt-4 w-full sm:w-auto">
          <Link href={completion.tasks.find((task) => !task.done && !task.future)?.href ?? "/profile"}>
            Continue
          </Link>
        </Button>
      ) : null}
    </section>
  );
}
