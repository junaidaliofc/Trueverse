"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Mail, UserRound, Handshake, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledProgress } from "@/components/ui/progress-field";
import { ONBOARDING_STEPS } from "@/lib/profile-completion";
import { cn } from "@/lib/utils";

const ICONS = [Camera, Mail, UserRound, Handshake, Users];

export function OnboardingFlow({
  open,
  onDismiss
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  if (!open) return null;

  const current = ONBOARDING_STEPS[step];
  const Icon = ICONS[step] ?? UserRound;
  const percent = Math.round(((step + 1) / ONBOARDING_STEPS.length) * 100);

  function finish() {
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-background/75 backdrop-blur-md"
        aria-label="Dismiss onboarding"
        onClick={finish}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="glass-elevated relative z-10 w-full max-w-md rounded-[1.85rem] p-6"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Welcome to Trueverse
        </p>
        <div className="mt-4 flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon className="size-7" />
        </div>
        <h2 id="onboarding-title" className="mt-4 font-display text-2xl font-bold tracking-tight">
          Step {step + 1}. {current.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{current.body}</p>

        <LabeledProgress className="mt-5" value={percent} label={`Step ${step + 1} of ${ONBOARDING_STEPS.length}`} />

        <div className="mt-4 flex gap-1.5">
          {ONBOARDING_STEPS.map((item, index) => (
            <span
              key={item.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-500",
                index <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              router.push(current.href);
              if (step >= ONBOARDING_STEPS.length - 1) finish();
              else setStep((value) => value + 1);
            }}
          >
            {step === ONBOARDING_STEPS.length - 1 ? "Join community" : "Continue"}
          </Button>
          {step < ONBOARDING_STEPS.length - 1 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((value) => value + 1)}>
              Skip
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={finish}>
              Finish later
            </Button>
          )}
        </div>
        <Link href="/dashboard" className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground" onClick={finish}>
          Remind me later
        </Link>
      </div>
    </div>
  );
}
