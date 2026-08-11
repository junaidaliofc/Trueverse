"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { PassportQR } from "@/components/passport/passport-qr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PassportSharePanel({
  sharePath,
  displayName,
  trueverseId,
  className,
  absoluteOrigin
}: {
  sharePath: string;
  displayName: string;
  trueverseId: string;
  className?: string;
  /** Optional absolute origin for QR / copy. Defaults to window origin on client. */
  absoluteOrigin?: string;
}) {
  const [copied, setCopied] = useState(false);
  const origin =
    absoluteOrigin ??
    (typeof window !== "undefined" ? window.location.origin : "https://trueverse.app");
  const shareUrl = `${origin}${sharePath}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={cn("glass-elevated overflow-hidden rounded-[1.75rem]", className)}>
      <div className="bg-accent px-6 py-7 text-accent-foreground">
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-teal-200/90">
          Public sharing
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">{displayName}</h2>
        <p className="mt-1 font-mono text-sm text-teal-100/75">{trueverseId}</p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-teal-50/75">
          Share a privacy-respecting Passport link. Private contact details stay private.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 px-6 py-8">
        <PassportQR value={shareUrl} />
        <p className="break-all text-center font-mono text-xs text-muted-foreground">{shareUrl}</p>
        <div className="flex w-full flex-wrap gap-3">
          <Button className="flex-1" onClick={copyLink}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={sharePath}>
              <ExternalLink className="size-4" />
              Open Passport
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
