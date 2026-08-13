"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { CommunityCommentView } from "@/lib/types";
import { authorHandle } from "@/lib/community";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

export function CommentsPanel({
  postId,
  open,
  viewerId,
  onCountChange,
  comments,
  loading,
  onCommentsChange
}: {
  postId: string;
  open: boolean;
  viewerId?: string | null;
  onCountChange?: (delta: number) => void;
  comments: CommunityCommentView[];
  loading: boolean;
  onCommentsChange: (comments: CommunityCommentView[]) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      setError("");
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Unable to comment.");
        return;
      }
      onCommentsChange([...comments, payload.comment]);
      setBody("");
      onCountChange?.(1);
    });
  }

  function remove(commentId: string) {
    startTransition(async () => {
      const response = await fetch(
        `/api/community/posts/${postId}/comments/${commentId}`,
        { method: "DELETE" }
      );
      if (!response.ok) return;
      onCommentsChange(comments.filter((c) => c.id !== commentId));
      onCountChange?.(-1);
    });
  }

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="overflow-hidden"
        >
          <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-4/5 rounded-2xl" />
              </div>
            ) : comments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
                No comments yet. Be the first to respond.
              </p>
            ) : (
              <ul className="space-y-3">
                {comments.map((comment) => {
                  const name = comment.author?.full_name || "Member";
                  const handle = authorHandle(comment.author);
                  const mine = viewerId && comment.author_id === viewerId;
                  return (
                    <li
                      key={comment.id}
                      className="flex items-start gap-3 rounded-2xl bg-muted/35 px-3 py-3"
                    >
                      <UserAvatar
                        name={name}
                        src={comment.author?.photo_url}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">@{handle}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.created_at)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-foreground/90">
                          {comment.body}
                        </p>
                      </div>
                      {mine ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          disabled={pending}
                          aria-label="Delete comment"
                          onClick={() => remove(comment.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="space-y-2">
              <Label htmlFor={`comment-${postId}`}>Add a comment</Label>
              <Textarea
                id={`comment-${postId}`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a short reply…"
                className="min-h-20 rounded-2xl"
                maxLength={800}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="button"
                size="sm"
                disabled={pending || body.trim().length < 1}
                onClick={submit}
                className="min-h-10"
              >
                {pending ? "Posting…" : "Post comment"}
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
