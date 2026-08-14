"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import type { PassportEmptyStep } from "@/lib/passport-mock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PassportGettingStarted({
  steps,
  className
}: {
  steps: PassportEmptyStep[];
  className?: string;
}) {
  return (
    <section className={cn("glass-elevated rounded-[1.75rem] p-5", className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
        Getting started
      </p>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
        Build your Passport
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        New members start here instead of empty cards.
      </p>
      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Button
              asChild
              variant="secondary"
              className={cn(
                "h-auto w-full justify-between py-3",
                step.done && "opacity-70"
              )}
            >
              <Link href={step.href}>
                <span className="flex min-w-0 items-start gap-3 text-left">
                  {step.done ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <span className="mt-0.5 size-4 shrink-0 rounded-full ring-2 ring-border" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold">{step.title}</span>
                    {step.description ? (
                      <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground">
                        {step.description}
                      </span>
                    ) : null}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
