"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FollowButton({
  trueverseId,
  initialFollowing = false,
  className,
  size = "sm"
}: {
  trueverseId: string;
  initialFollowing?: boolean;
  className?: string;
  size?: "sm" | "default";
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  function onToggle() {
    startTransition(async () => {
      const next = !following;
      setFollowing(next);
      try {
        const response = await fetch("/api/social/follow", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ following_trueverse_id: trueverseId })
        });
        if (!response.ok) {
          // Prototype / unauthenticated: keep optimistic UI for demo.
          if (response.status !== 401) setFollowing(!next);
        }
      } catch {
        // Keep optimistic state for offline/demo.
      }
    });
  }

  return (
    <motion.div whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
      <Button
        type="button"
        size={size}
        variant={following ? "secondary" : "default"}
        className={cn(className)}
        disabled={pending}
        onClick={onToggle}
        aria-pressed={following}
      >
        {following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
        {following ? "Following" : "Follow"}
      </Button>
    </motion.div>
  );
}
