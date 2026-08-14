import Link from "next/link";
import { Check } from "lucide-react";
import { LAUNCH_CHECKLIST } from "@/lib/trust-os";

export const metadata = {
  title: "Launch readiness — Trueverse",
  description: "Public beta checklist. Trust is earned, never manufactured."
};

export default function LaunchReadinessPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-10">
      <header className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Public beta</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">Launch readiness</h1>
        <p className="text-sm leading-7 text-foreground/80">
          Trueverse is ready for a first public beta when these systems are honest, reviewable, and
          separate from Trust Score.
        </p>
      </header>
      <ul className="space-y-2">
        {LAUNCH_CHECKLIST.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="glass-elevated flex items-center gap-3 rounded-[1.25rem] px-4 py-3 hover:ring-1 hover:ring-primary/30"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="font-semibold text-foreground">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
