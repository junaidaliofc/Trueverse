import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PositiveInteractionForm, NegativeReportForm } from "@/components/interaction-forms";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CreateInteractionPage({
  searchParams
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  await requireUser();
  const { to } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Interactions
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Start an Interaction</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Record a real interaction with another member. It becomes a Verified Interaction once
            they confirm it occurred. Starting an interaction does not change anyone&rsquo;s
            reputation on its own.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/interactions">View history</Link>
        </Button>
      </div>

      <PositiveInteractionForm defaultRecipient={to} />

      <div className="border-t border-border/60 pt-8">
        <NegativeReportForm />
      </div>
    </div>
  );
}
