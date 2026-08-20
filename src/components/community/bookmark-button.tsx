"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  postId,
  initialBookmarked,
  className
}: {
  postId: string;
  initialBookmarked: boolean;
  className?: string;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const previous = bookmarked;
      setBookmarked(!previous);
      const response = await fetch(`/api/community/posts/${postId}/bookmarks`, {
        method: "POST"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setBookmarked(previous);
        return;
      }
      setBookmarked(Boolean(payload.bookmarked));
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={toggle}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove save" : "Save post"}
      className={cn("min-h-10", className)}
    >
      <Bookmark
        className={cn("size-4", bookmarked && "fill-primary text-primary")}
      />
      <span className="sr-only sm:not-sr-only sm:inline">
        {bookmarked ? "Saved" : "Save"}
      </span>
    </Button>
  );
}
