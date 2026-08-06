"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityCommentItem } from "@/lib/dummy-data";
import { currentUser } from "@/lib/dummy-data";

export function CommentThread({
  activityId,
  initialComments = []
}: {
  activityId: string;
  initialComments?: ActivityCommentItem[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const optimistic: ActivityCommentItem = {
        id: `local-${Date.now()}`,
        activity_id: activityId,
        author_id: currentUser.id,
        author_name: currentUser.full_name,
        author_trueverse_id: currentUser.trueverse_id,
        body: trimmed,
        created_at: new Date().toISOString()
      };
      setComments((list) => [...list, optimistic]);
      setBody("");

      try {
        await fetch("/api/social/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity_id: activityId, body: trimmed })
        });
      } catch {
        // Keep optimistic comment for demo
      }
    });
  }

  return (
    <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <UserAvatar name={comment.author_name} size="sm" />
            <div className="min-w-0 flex-1 rounded-2xl bg-muted/50 px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/u/${comment.author_trueverse_id.replace(/^tv_/, "")}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {comment.author_name}
                </Link>
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-foreground">{comment.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Be the first to leave a thoughtful comment.</p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a comment…"
          className="min-h-20 rounded-2xl"
          maxLength={500}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending || !body.trim()}>
            Comment
          </Button>
        </div>
      </form>
    </div>
  );
}
