import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PositiveInteractionForm, NegativeReportForm } from "@/components/interaction-forms";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CreateInteractionPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Trust Acts</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Record a Trust Act</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            The recipient confirms the help, then a moderator reviews it. Trust updates only on
            approval. Reports never change Trust until evidence is approved. XP is never affected
            here.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/interactions">View history</Link>
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <PositiveInteractionForm />
        <NegativeReportForm />
      </section>
    </div>
  );
}
