"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { communityPostPath } from "@/lib/community";
import { cn } from "@/lib/utils";

export function SharePostButton({
  postId,
  className
}: {
  postId: string;
  title?: string | null;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    const url = `${window.location.origin}${communityPostPath(postId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={copyUrl}
      className={cn("min-h-11", className)}
    >
      <Share2 className="size-4" />
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
