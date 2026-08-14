import type { ChatMessage, ConversationView, MessagePeer } from "@/lib/messages";

export async function fetchConversationList() {
  const response = await fetch("/api/messages/conversations");
  const payload = (await response.json()) as {
    conversations?: ConversationView[];
    error?: string;
  };
  return { ok: response.ok, status: response.status, ...payload };
}

export async function fetchConversationThread(id: string) {
  const response = await fetch(`/api/messages/conversations/${id}`);
  const payload = (await response.json()) as {
    conversation?: ConversationView | null;
    messages?: ChatMessage[];
    error?: string;
  };
  return { ok: response.ok, status: response.status, ...payload };
}

export async function startConversationRequest(input: {
  peer_id?: string;
  trueverse_id?: string;
}) {
  const response = await fetch("/api/messages/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const payload = (await response.json()) as {
    id?: string;
    conversation?: ConversationView;
    error?: string;
  };
  return { ok: response.ok, status: response.status, ...payload };
}

export async function sendMessageRequest(conversationId: string, body: string) {
  const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body })
  });
  const payload = (await response.json()) as {
    message?: ChatMessage;
    error?: string;
  };
  return { ok: response.ok, status: response.status, ...payload };
}

export async function searchPeopleRequest(query: string) {
  const response = await fetch(`/api/messages/people?q=${encodeURIComponent(query)}`);
  const payload = (await response.json()) as {
    people?: MessagePeer[];
    error?: string;
  };
  return { ok: response.ok, status: response.status, ...payload };
}
