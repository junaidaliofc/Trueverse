"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommunityReactionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReactionBar({
  postId,
  likeCount,
  appreciateCount,
  likedByMe,
  appreciatedByMe
}: {
  postId: string;
  likeCount: number;
  appreciateCount: number;
  likedByMe: boolean;
  appreciatedByMe: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [likes, setLikes] = useState(likeCount);
  const [appreciates, setAppreciates] = useState(appreciateCount);
  const [liked, setLiked] = useState(likedByMe);
  const [appreciated, setAppreciated] = useState(appreciatedByMe);
  const [pending, startTransition] = useTransition();
  const [pulse, setPulse] = useState<CommunityReactionType | null>(null);

  function toggle(type: CommunityReactionType) {
    startTransition(async () => {
      const isLike = type === "like";
      const wasActive = isLike ? liked : appreciated;
      if (isLike) {
        setLiked(!wasActive);
        setLikes((n) => Math.max(0, n + (wasActive ? -1 : 1)));
      } else {
        setAppreciated(!wasActive);
        setAppreciates((n) => Math.max(0, n + (wasActive ? -1 : 1)));
      }
      setPulse(type);

      const response = await fetch(`/api/community/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_type: type })
      });

      if (!response.ok) {
        if (isLike) {
          setLiked(wasActive);
          setLikes((n) => Math.max(0, n + (wasActive ? 1 : -1)));
        } else {
          setAppreciated(wasActive);
          setAppreciates((n) => Math.max(0, n + (wasActive ? 1 : -1)));
        }
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
        onClick={() => toggle("like")}
        aria-pressed={liked}
        className={cn("min-h-10", liked && "bg-brand-soft text-brand")}
      >
        <motion.span
          animate={
            !reduceMotion && pulse === "like"
              ? { scale: [1, 1.25, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.28 }}
          onAnimationComplete={() => setPulse(null)}
        >
          <Heart className={cn("size-4", liked && "fill-current")} />
        </motion.span>
        <span className="tabular-nums">{likes}</span>
        <span className="sr-only sm:not-sr-only">Like</span>
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={pending}
        onClick={() => toggle("appreciate")}
        aria-pressed={appreciated}
        className={cn("min-h-10", appreciated && "bg-xp-soft text-xp")}
        title="Social appreciation only — does not change trust"
      >
        <motion.span
          animate={
            !reduceMotion && pulse === "appreciate"
              ? { scale: [1, 1.25, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.28 }}
        >
          <Sparkles className="size-4" />
        </motion.span>
        <span className="tabular-nums">{appreciates}</span>
        <span className="sr-only sm:not-sr-only">Appreciate</span>
      </Button>
    </div>
  );
}
