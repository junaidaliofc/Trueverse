import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Messaging deferred for public beta — keep route for navigation. */
export default function MessagesPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-2 py-16 text-center sm:max-w-xl">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <MessageCircle className="size-7" aria-hidden />
      </span>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        Messages
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
        Coming soon
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Direct messaging is not part of this beta release. Your Passport, Community, and Trust
        Acts remain available now.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/passport">Open Passport</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/community">Community</Link>
        </Button>
      </div>
    </div>
  );
}
