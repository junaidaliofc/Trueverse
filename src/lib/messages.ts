import { scoreToTrustLevel } from "@/lib/design";
import { formatRelativeTime } from "@/lib/utils";

export const MESSAGE_BODY_MAX = 2000;

export type MessagePeer = {
  id: string;
  full_name: string;
  photo_url: string | null;
  trueverse_id: string;
  username?: string | null;
  trust_score: number;
};

export type ConversationView = {
  id: string;
  peer: MessagePeer;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  peer_last_read_at: string | null;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  image_url: string | null;
  created_at: string;
  seen: boolean;
};

export function peerHandle(peer: MessagePeer) {
  if (peer.username) return peer.username.replace(/^@/, "").toLowerCase();
  return peer.trueverse_id.replace(/^tv_/, "").toLowerCase();
}

export function peerTrustLevel(peer: MessagePeer) {
  const score =
    peer.trust_score > 100 ? Math.round(peer.trust_score / 10) : peer.trust_score;
  return scoreToTrustLevel(Math.max(0, Math.min(100, score)));
}

export function sortConversations(items: ConversationView[]) {
  return [...items].sort((a, b) => {
    const unreadDelta = Number(b.unread_count > 0) - Number(a.unread_count > 0);
    if (unreadDelta !== 0) return unreadDelta;
    const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return bTime - aTime;
  });
}

export function filterConversations(items: ConversationView[], query: string) {
  const q = query.trim().toLowerCase().replace(/^@/, "");
  if (!q) return items;
  return items.filter((item) => {
    const name = item.peer.full_name.toLowerCase();
    const tv = item.peer.trueverse_id.toLowerCase();
    const handle = peerHandle(item.peer);
    return name.includes(q) || tv.includes(q) || handle.includes(q);
  });
}

export function formatLastSeen(iso: string | null) {
  if (!iso) return "Last seen a while ago";
  return `Last seen ${formatRelativeTime(iso)}`;
}

export function formatMessageClock(iso: string) {
  const value = new Date(iso);
  const now = new Date();
  const sameDay = value.toDateString() === now.toDateString();
  if (sameDay) {
    return value.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return formatRelativeTime(iso);
}

export function conversationPath(id: string) {
  return `/messages/${id}`;
}

export function isMissingRelation(error: string) {
  return /does not exist|relation/i.test(error);
}
