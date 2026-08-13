"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  HandHeart,
  HelpCircle,
  Megaphone,
  X
} from "lucide-react";
import type { CommunityPostType } from "@/lib/types";
import { POST_TYPE_META } from "@/lib/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const ACTIONS: Array<{
  type: CommunityPostType;
  icon: typeof HandHeart;
}> = [
  { type: "trust_act", icon: HandHeart },
  { type: "update", icon: Megaphone },
  { type: "help", icon: HelpCircle },
  { type: "event", icon: CalendarDays }
];

export function CommunityComposer({
  authorName,
  authorPhoto,
  onCreated
}: {
  authorName: string;
  authorPhoto?: string | null;
  onCreated?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<CommunityPostType | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const meta = selected ? POST_TYPE_META[selected] : null;

  function reset() {
    setSelected(null);
    setTitle("");
    setBody("");
    setImageUrl("");
    setError("");
  }

  function submit() {
    if (!selected) return;
    startTransition(async () => {
      setError("");
      setMessage("");
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_type: selected,
          title,
          body,
          image_url: imageUrl
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Unable to publish.");
        return;
      }
      setMessage("Published to Community.");
      reset();
      onCreated?.();
    });
  }

  return (
    <section className="glass rounded-[1.6rem] p-4 sm:rounded-[1.75rem] sm:p-5">
      <div className="flex items-start gap-3">
        <UserAvatar name={authorName} src={authorPhoto} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            What&apos;s happening in your community?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ACTIONS.map(({ type, icon: Icon }) => {
              const active = selected === type;
              return (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "secondary"}
                  className="min-h-10 rounded-full"
                  onClick={() => setSelected(active ? null : type)}
                >
                  <Icon className="size-4" />
                  {POST_TYPE_META[type].composerLabel}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selected && meta ? (
          <motion.div
            key={selected}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {meta.composerLabel}
                </p>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Close composer"
                  onClick={reset}
                >
                  <X className="size-4" />
                </Button>
              </div>

              {(selected === "event" || selected === "help" || selected === "trust_act") && (
                <div className="space-y-2">
                  <Label htmlFor="composer-title">Title (optional)</Label>
                  <Input
                    id="composer-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short headline"
                    className="h-11 rounded-2xl"
                    maxLength={120}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="composer-body">Post</Label>
                <Textarea
                  id="composer-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={meta.placeholder}
                  className="min-h-28 rounded-2xl"
                  maxLength={4000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="composer-image">Image URL (optional)</Label>
                <Input
                  id="composer-image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://"
                  className="h-11 rounded-2xl"
                />
              </div>

              {selected === "trust_act" ? (
                <p className="text-xs leading-5 text-muted-foreground">
                  This is a community recognition post. To change someone&apos;s
                  Trust Score, use a verified Trust Act acceptance flow — likes
                  here never change trust.
                </p>
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {message ? <p className="text-sm text-success">{message}</p> : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={pending || body.trim().length < 1}
                  onClick={submit}
                  className={cn("min-h-11")}
                >
                  {pending ? "Publishing…" : "Publish"}
                </Button>
                <Button type="button" variant="outline" onClick={reset} className="min-h-11">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
