"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Low-tech V1 invite: copy (or native-share) an appropriate signup URL. */
export function InviteButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function invite() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://trueverse.app";
    const url = `${origin}/auth/signup`;
    const shareData = {
      title: "Join me on Trueverse",
      text: "Create your Trueverse Passport — verified identity and real interaction history.",
      url
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" onClick={invite} className={className}>
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Invite link copied" : "Invite to Trueverse"}
    </Button>
  );
}
