"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionItem, MotionPage } from "@/components/motion/primitives";

/** Messages — reserved for a future release. Beautiful empty state only. */
export default function MessagesPage() {
  return (
    <MotionPage className="mx-auto flex max-w-lg flex-col items-center px-2 py-16 text-center sm:py-24">
      <MotionItem>
        <div className="mx-auto flex size-16 items-center justify-center rounded-[1.5rem] bg-brand-soft text-brand">
          <MessageCircle className="size-7" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Messages</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Private conversations are coming soon. For now, appreciate people in the community and
          keep building your reputation.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/community">Explore community</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back home</Link>
          </Button>
        </div>
      </MotionItem>
    </MotionPage>
  );
}
