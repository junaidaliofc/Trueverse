"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { shouldShowOnboarding, type ProfileCompletion } from "@/lib/profile-completion";

const DISMISS_KEY = "trueverse.onboarding-dismissed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getDismissed() {
  return window.localStorage.getItem(DISMISS_KEY) === "1";
}

function emitDismissed() {
  listeners.forEach((listener) => listener());
}

const OnboardingFlow = dynamic(
  () => import("@/components/onboarding/onboarding-flow").then((mod) => mod.OnboardingFlow),
  { ssr: false }
);

export function OnboardingHost({
  completion,
  createdAt
}: {
  completion: ProfileCompletion;
  createdAt: string;
}) {
  const dismissed = useSyncExternalStore(subscribe, getDismissed, () => true);
  const open = !dismissed && shouldShowOnboarding(completion, createdAt);

  return (
    <OnboardingFlow
      open={open}
      onDismiss={() => {
        window.localStorage.setItem(DISMISS_KEY, "1");
        emitDismissed();
      }}
    />
  );
}
