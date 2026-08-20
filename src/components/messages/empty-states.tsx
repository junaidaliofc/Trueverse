import { MessageCircle } from "lucide-react";

export function ConversationsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <MessageCircle className="size-7" aria-hidden />
      </span>
      <p className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
        No conversations yet.
      </p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        Start your first conversation.
      </p>
    </div>
  );
}

export function ChatEmptyPane() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <MessageCircle className="size-7" aria-hidden />
      </span>
      <p className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
        Select a conversation
      </p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Choose someone from the list, or search for a member to start a calm, private thread.
      </p>
    </div>
  );
}
