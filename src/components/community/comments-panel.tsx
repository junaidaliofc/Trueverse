"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { CommunityAuthor, CommunityCommentView } from "@/lib/types";
import { COMMENT_BODY_MAX, authorHandle } from "@/lib/community";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { AutoGrowTextarea } from "@/components/ui/auto-textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

export function CommentsPanel({
  postId,
  viewerId,
  viewer,
  onCountChange,
  comments,
  loading,
  onCommentsChange,
  local = false
}: {
  postId: string;
  viewerId?: string | null;
  viewer?: CommunityAuthor | null;
  onCountChange?: (delta: number) => void;
  comments: CommunityCommentView[];
  loading: boolean;
  onCommentsChange: (comments: CommunityCommentView[]) => void;
  local?: boolean;
}) {
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function localAuthor(): CommunityAuthor {
    return (
      viewer ?? {
        id: viewerId || "local-viewer",
        full_name: "You",
        photo_url: null,
        trust_score: 0,
        trueverse_id: "tv_you",
        username: "you"
      }
    );
  }

  function submit() {
    startTransition(async () => {
      setError("");
      if (local) {
        const author = localAuthor();
        onCommentsChange([
          ...comments,
          {
            id: crypto.randomUUID(),
            post_id: postId,
            author_id: author.id,
            body: body.trim(),
            is_hidden: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author
          }
        ]);
        setBody("");
        onCountChange?.(1);
        return;
      }

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

  function saveEdit(commentId: string) {
    startTransition(async () => {
      setError("");
      if (local) {
        onCommentsChange(
          comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, body: editBody.trim(), updated_at: new Date().toISOString() }
              : comment
          )
        );
        setEditingId(null);
        return;
      }

      const response = await fetch(`/api/community/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Unable to edit comment.");
        return;
      }
      onCommentsChange(
        comments.map((comment) => (comment.id === commentId ? payload.comment : comment))
      );
      setEditingId(null);
    });
  }

  function remove(commentId: string) {
    startTransition(async () => {
      if (local) {
        onCommentsChange(comments.filter((comment) => comment.id !== commentId));
        onCountChange?.(-1);
        return;
      }
      const response = await fetch(`/api/community/posts/${postId}/comments/${commentId}`, {
        method: "DELETE"
      });
      if (!response.ok) return;
      onCommentsChange(comments.filter((comment) => comment.id !== commentId));
      onCountChange?.(-1);
    });
  }

  return (
    <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-4/5 rounded-2xl" />
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
            const mine = Boolean(viewerId && comment.author_id === viewerId);
            const editing = editingId === comment.id;
            return (
              <li
                key={comment.id}
                className="flex items-start gap-3 rounded-2xl bg-muted/35 px-3 py-3"
              >
                <UserAvatar name={name} src={comment.author?.photo_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">@{handle}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.created_at)}
                    </p>
                  </div>
                  {editing ? (
                    <div className="mt-2 space-y-2">
                      <AutoGrowTextarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value.slice(0, COMMENT_BODY_MAX))}
                        className="rounded-2xl"
                        maxLength={COMMENT_BODY_MAX}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending || editBody.trim().length < 1}
                          onClick={() => saveEdit(comment.id)}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-foreground/90">{comment.body}</p>
                  )}
                </div>
                {mine && !editing ? (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      disabled={pending}
                      aria-label="Edit comment"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditBody(comment.body);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
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
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-2">
        <Label htmlFor={`comment-${postId}`}>Add a comment</Label>
        <AutoGrowTextarea
          id={`comment-${postId}`}
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, COMMENT_BODY_MAX))}
          placeholder="Write a short reply…"
          className="rounded-2xl"
          maxLength={COMMENT_BODY_MAX}
        />
        <p className="text-right text-xs tabular-nums text-muted-foreground">
          {body.length}/{COMMENT_BODY_MAX}
        </p>
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
  );
}
