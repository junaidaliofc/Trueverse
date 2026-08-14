"use client";

import { useState, useTransition } from "react";
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReactionBar({
  postId,
  appreciateCount,
  appreciatedByMe
}: {
  postId: string;
  likeCount?: number;
  appreciateCount: number;
  likedByMe?: boolean;
  appreciatedByMe: boolean;
}) {
  const [appreciates, setAppreciates] = useState(appreciateCount);
  const [appreciated, setAppreciated] = useState(appreciatedByMe);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const wasActive = appreciated;
      setAppreciated(!wasActive);
      setAppreciates((n) => Math.max(0, n + (wasActive ? -1 : 1)));

      const response = await fetch(`/api/community/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_type: "appreciate" })
      });

      if (!response.ok) {
        setAppreciated(wasActive);
        setAppreciates((n) => Math.max(0, n + (wasActive ? 1 : -1)));
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={pending}
        onClick={toggle}
        aria-pressed={appreciated}
        className={cn("min-h-11", appreciated && "bg-brand-soft text-brand")}
        title="Social appreciation only — does not change trust"
      >
        <Handshake className="size-4" />
        Appreciate
        <span className="tabular-nums">{appreciates}</span>
      </Button>
    </div>
  );
}
