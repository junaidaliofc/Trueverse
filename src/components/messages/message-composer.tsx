"use client";

import { useState } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoGrowTextarea } from "@/components/ui/auto-textarea";
import { MESSAGE_BODY_MAX } from "@/lib/messages";
import { cn } from "@/lib/utils";

const EMOJIS = ["👍", "❤️", "🙏", "😊", "🎉", "✨", "👋", "🙌", "💪", "🌿"];

export function MessageComposer({
  onSend,
  disabled,
  sending
}: {
  onSend: (body: string) => Promise<void> | void;
  disabled?: boolean;
  sending?: boolean;
}) {
  const [value, setValue] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled && !sending;

  async function submit() {
    if (!canSend) return;
    const body = trimmed.slice(0, MESSAGE_BODY_MAX);
    setValue("");
    setEmojiOpen(false);
    setHint(null);
    await onSend(body);
  }

  return (
    <div className="relative border-t border-border/60 bg-background/70 p-3 backdrop-blur-xl">
      {hint ? (
        <p className="mb-2 px-1 text-xs text-muted-foreground" role="status">
          {hint}
        </p>
      ) : null}
      {emojiOpen ? (
        <div className="absolute bottom-[4.75rem] left-3 z-10 flex flex-wrap gap-1 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-lg">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="size-9 rounded-xl text-lg hover:bg-muted"
              onClick={() => {
                setValue((current) => `${current}${emoji}`);
                setEmojiOpen(false);
              }}
              aria-label={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
      <form
        className="flex items-end gap-1.5 rounded-[1.6rem] bg-muted/70 p-1.5 ring-1 ring-border/70"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Emoji"
          aria-expanded={emojiOpen}
          onClick={() => setEmojiOpen((open) => !open)}
          disabled={disabled}
        >
          <Smile className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Attachment"
          onClick={() => setHint("Photo attachments are coming soon.")}
          disabled={disabled}
        >
          <Paperclip className="size-4" />
        </Button>
        <AutoGrowTextarea
          value={value}
          minHeight={44}
          maxLength={MESSAGE_BODY_MAX}
          disabled={disabled}
          placeholder="Write a message..."
          aria-label="Write a message"
          rows={1}
          className={cn(
            "max-h-32 min-h-11 flex-1 border-0 bg-transparent px-2 py-2.5 shadow-none ring-0",
            "[field-sizing:fixed] focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
          )}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <Button
          type="submit"
          size="icon-sm"
          aria-label="Send"
          disabled={!canSend}
          className="mb-0.5"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
