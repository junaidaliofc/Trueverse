"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { communityPostPath } from "@/lib/community";
import { cn } from "@/lib/utils";

export function SharePostButton({
  postId,
  title,
  className
}: {
  postId: string;
  title?: string | null;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${communityPostPath(postId)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Trueverse community post",
          url
        });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // user cancelled share — ignore
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={share}
      className={cn("min-h-10", className)}
    >
      <Share2 className="size-4" />
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
