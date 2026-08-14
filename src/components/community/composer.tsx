"use client";

import { useState, useTransition } from "react";
import { Award, HelpCircle, ImagePlus, MapPin, Megaphone, X } from "lucide-react";
import type { CommunityPostType } from "@/lib/types";
import {
  COMMUNITY_CATEGORIES,
  COMPOSER_POST_TYPES,
  POST_BODY_MAX,
  POST_TYPE_META
} from "@/lib/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AutoGrowTextarea } from "@/components/ui/auto-textarea";
import { cn } from "@/lib/utils";

const ICONS: Record<(typeof COMPOSER_POST_TYPES)[number], typeof Megaphone> = {
  update: Megaphone,
  achievement: Award,
  help: HelpCircle
};

export function CommunityComposer({
  authorName,
  authorPhoto,
  onCreated
}: {
  authorName: string;
  authorPhoto?: string | null;
  onCreated?: () => void;
}) {
  const [selected, setSelected] = useState<CommunityPostType>("update");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<(typeof COMMUNITY_CATEGORIES)[number]>(
    "Neighborhood"
  );
  const [location, setLocation] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const meta = POST_TYPE_META[selected];
  const remaining = POST_BODY_MAX - body.length;

  function reset() {
    setBody("");
    setImageUrl("");
    setLocation("");
    setCategory("Neighborhood");
    setShowImage(false);
    setError("");
  }

  function submit() {
    startTransition(async () => {
      setError("");
      setMessage("");
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_type: selected,
          body,
          image_url: imageUrl,
          category,
          location
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
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Create a post
          </p>
          <div className="flex flex-wrap gap-2">
            {COMPOSER_POST_TYPES.map((type) => {
              const active = selected === type;
              const Icon = ICONS[type];
              return (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "secondary"}
                  className="min-h-10 rounded-full"
                  onClick={() => setSelected(type)}
                >
                  <Icon className="size-4" />
                  {POST_TYPE_META[type].composerLabel}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
        <div className="space-y-2">
          <Label htmlFor="composer-body">{meta.composerLabel}</Label>
          <AutoGrowTextarea
            id="composer-body"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, POST_BODY_MAX))}
            placeholder={meta.placeholder}
            className="rounded-2xl"
            maxLength={POST_BODY_MAX}
          />
          <p
            className={cn(
              "text-right text-xs tabular-nums",
              remaining < 80 ? "text-warning" : "text-muted-foreground"
            )}
          >
            {body.length}/{POST_BODY_MAX}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMUNITY_CATEGORIES.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "min-h-9 rounded-full px-3 text-xs font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="composer-location">Location (optional)</Label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="composer-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Neighborhood or city"
                className="h-11 rounded-2xl pl-9"
                maxLength={80}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="composer-image">Image (optional)</Label>
            {showImage ? (
              <div className="flex gap-2">
                <Input
                  id="composer-image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://"
                  className="h-11 rounded-2xl"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Remove image field"
                  onClick={() => {
                    setShowImage(false);
                    setImageUrl("");
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full justify-start"
                onClick={() => setShowImage(true)}
              >
                <ImagePlus className="size-4" />
                Add image URL
              </Button>
            )}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={reset} className="min-h-11">
            Clear
          </Button>
          <Button
            type="button"
            disabled={pending || body.trim().length < 1}
            onClick={submit}
            className="min-h-11"
          >
            {pending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
    </section>
  );
}
