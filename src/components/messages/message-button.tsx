"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConversationRequest } from "@/lib/messages-client";
import { conversationPath } from "@/lib/messages";
import { cn } from "@/lib/utils";

export function MessageButton({
  trueverseId,
  peerId,
  label = "Message",
  className,
  size = "sm",
  variant = "outline",
  mock = false
}: {
  trueverseId?: string | null;
  peerId?: string | null;
  label?: string;
  className?: string;
  size?: "sm" | "default";
  variant?: "outline" | "default" | "secondary";
  mock?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const handle = (trueverseId ?? "").replace(/^@/, "");

  function onClick() {
    if (mock || (!handle && !peerId)) return;
    startTransition(async () => {
      const result = await startConversationRequest({
        trueverse_id: handle || undefined,
        peer_id: peerId || undefined
      });
      if (result.status === 401) {
        const next = `/messages?to=${encodeURIComponent(handle || peerId || "")}`;
        router.push(`/auth/login?next=${encodeURIComponent(next)}`);
        return;
      }
      if (result.id) {
        router.push(conversationPath(result.id));
      }
    });
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn("min-h-9", className)}
      disabled={pending || (!handle && !peerId)}
      onClick={onClick}
    >
      <MessageCircle className="size-4" />
      {label}
    </Button>
  );
}
