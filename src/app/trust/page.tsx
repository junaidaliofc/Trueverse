import { ShieldCheck } from "lucide-react";
import { IDENTITY_ARCHITECTURE } from "@/lib/trust-os";

export const metadata = {
  title: "Trust principles — Trueverse",
  description:
    "Trust is earned from verified real-world interactions. It is not popularity, status, or guaranteed safety."
};

const SECTIONS = [
  {
    title: "How Trust works",
    body: "Trust is earned from verified real-world interactions — Trust Acts that another person confirms, then a moderator approves. Likes, follows, streaks, and XP never raise Trust."
  },
  {
    title: "How Reports work",
    body: "Anyone can file an evidence-backed report. Nothing happens to Trust until an admin reviews the evidence. Approved reports may apply a penalty. Rejected reports change nothing."
  },
  {
    title: "How Appeals work",
    body: "Every moderation decision can be appealed. Appeals move through Pending, Under Review, Accepted, or Rejected. The history stays visible on your Passport record with the team."
  },
  {
    title: "What Trust does NOT mean",
    body: "Trust is not popularity. Trust is not political agreement. Trust is not social status. Trust is not guaranteed safety. A high Trust Score is a history of confirmed help — not a promise that someone cannot cause harm."
  },
  {
    title: "Privacy",
    body: "Sensitive reports stay out of public Passport views. Device and identity signals are prepared for future one-person-one-reputation checks and are not required to use Trueverse today."
  },
  {
    title: "Moderation philosophy",
    body: "Moderators record a reason, a previous status, and a new status in an immutable audit log. Badges recognize contribution. Badges never manufacture Trust."
  }
] as const;

export default function TrustPrinciplesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-10">
      <header className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Public</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Trust principles</h1>
        <p className="text-sm leading-7 text-foreground/80">
          Trust is earned from verified real-world interactions. It is never manufactured by
          engagement, payment, or popularity.
        </p>
      </header>
      <ul className="space-y-4">
        {SECTIONS.map((section) => (
          <li key={section.title} className="glass-elevated rounded-[1.6rem] p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-foreground/80">{section.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-bold tracking-tight">One person, one reputation</h2>
        <p className="text-sm leading-7 text-foreground/80">
          Trueverse is designed so one person holds one reputation. The fields below are prepared for
          future enforcement. None of them are required today, and none of them manufacture Trust.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {IDENTITY_ARCHITECTURE.map((item) => (
            <li key={item.id} className="glass-elevated rounded-[1.4rem] p-4">
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-foreground/80">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
