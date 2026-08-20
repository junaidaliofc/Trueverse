import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMissingRelation,
  sortConversations,
  type ChatMessage,
  type ConversationView,
  type MessagePeer
} from "@/lib/messages";

type MemberRow = {
  conversation_id: string;
  profile_id: string;
  unread_count: number;
  last_read_at: string | null;
};

type ConversationRow = {
  id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
};

function asPeer(row: MessagePeer): MessagePeer {
  return {
    id: row.id,
    full_name: row.full_name,
    photo_url: row.photo_url,
    trueverse_id: row.trueverse_id,
    username: row.username,
    trust_score: row.trust_score
  };
}

export async function fetchConversations(
  supabase: SupabaseClient,
  viewerId: string
): Promise<{ conversations: ConversationView[]; error?: string }> {
  const { data: mine, error: mineError } = await supabase
    .from("conversation_members")
    .select("conversation_id, unread_count, last_read_at")
    .eq("profile_id", viewerId);

  if (mineError) return { conversations: [], error: mineError.message };
  const memberships = (mine ?? []) as Array<{
    conversation_id: string;
    unread_count: number;
    last_read_at: string | null;
  }>;
  if (!memberships.length) return { conversations: [] };

  const ids = memberships.map((row) => row.conversation_id);
  const [{ data: convos, error: convError }, { data: members, error: memError }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id, last_message_at, last_message_preview")
        .in("id", ids),
      supabase
        .from("conversation_members")
        .select("conversation_id, profile_id, unread_count, last_read_at")
        .in("conversation_id", ids)
    ]);

  if (convError) return { conversations: [], error: convError.message };
  if (memError) return { conversations: [], error: memError.message };

  const peers = ((members ?? []) as MemberRow[]).filter((row) => row.profile_id !== viewerId);
  const peerIds = peers.map((row) => row.profile_id);
  const { data: profiles } = peerIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, photo_url, trueverse_id, username, trust_score")
        .in("id", peerIds)
        .eq("is_disabled", false)
    : { data: [] as MessagePeer[] };

  const profileMap = new Map(((profiles ?? []) as MessagePeer[]).map((p) => [p.id, asPeer(p)]));
  const convoMap = new Map(((convos ?? []) as ConversationRow[]).map((c) => [c.id, c]));
  const mineMap = new Map(memberships.map((row) => [row.conversation_id, row]));
  const peerByConvo = new Map(peers.map((row) => [row.conversation_id, row]));

  const conversations: ConversationView[] = [];
  for (const id of ids) {
    const convo = convoMap.get(id);
    const mineRow = mineMap.get(id);
    const peerRow = peerByConvo.get(id);
    const peer = peerRow ? profileMap.get(peerRow.profile_id) : undefined;
    if (!convo || !mineRow || !peerRow || !peer) continue;
    conversations.push({
      id,
      peer,
      last_message: convo.last_message_preview,
      last_message_at: convo.last_message_at,
      unread_count: mineRow.unread_count,
      peer_last_read_at: peerRow.last_read_at
    });
  }

  return { conversations: sortConversations(conversations) };
}

export async function fetchConversationMessages(
  supabase: SupabaseClient,
  conversationId: string,
  viewerId: string
): Promise<{
  conversation: ConversationView | null;
  messages: ChatMessage[];
  error?: string;
}> {
  const { conversations, error } = await fetchConversations(supabase, viewerId);
  if (error) return { conversation: null, messages: [], error };
  const conversation = conversations.find((item) => item.id === conversationId) ?? null;
  if (!conversation) return { conversation: null, messages: [] };

  const { data, error: msgError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, image_url, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(120);

  if (msgError) return { conversation, messages: [], error: msgError.message };

  const peerRead = conversation.peer_last_read_at
    ? new Date(conversation.peer_last_read_at).getTime()
    : 0;

  const messages: ChatMessage[] = ((data ?? []) as ChatMessage[]).map((row) => ({
    ...row,
    seen:
      row.sender_id === viewerId &&
      peerRead > 0 &&
      new Date(row.created_at).getTime() <= peerRead
  }));

  return { conversation, messages };
}

export async function markConversationRead(
  supabase: SupabaseClient,
  conversationId: string,
  viewerId: string
) {
  await supabase
    .from("conversation_members")
    .update({ unread_count: 0, last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("profile_id", viewerId);
}

export async function resolveMessagePeer(
  supabase: SupabaseClient,
  input: { peer_id?: string; trueverse_id?: string }
): Promise<{ peer: { id: string } | null; error?: string }> {
  if (input.peer_id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", input.peer_id)
      .eq("is_disabled", false)
      .maybeSingle();
    if (error) return { peer: null, error: error.message };
    return { peer: data };
  }

  const key = (input.trueverse_id ?? "").replace(/^@/, "").trim();
  if (!key) return { peer: null };

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .or(`trueverse_id.eq.${key},username.eq.${key},trueverse_id.eq.tv_${key}`)
    .eq("is_disabled", false)
    .maybeSingle();

  if (error) return { peer: null, error: error.message };
  return { peer: data };
}

export async function getOrCreateDirectConversation(
  supabase: SupabaseClient,
  peerId: string
): Promise<{ id: string | null; error?: string }> {
  const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
    peer_id: peerId
  });
  if (error) return { id: null, error: error.message };
  return { id: (data as string | null) ?? null };
}

function sanitizeSearchTerm(query: string) {
  return query
    .replace(/^@/, "")
    .replace(/[%_,.()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

export async function searchMessagePeople(
  supabase: SupabaseClient,
  viewerId: string,
  query: string
): Promise<{ people: MessagePeer[]; error?: string }> {
  const q = query.trim();
  if (q.length < 1) return { people: [] };

  const looksLikeEmail = q.includes("@");

  if (looksLikeEmail) {
    const { data: peerId, error: rpcError } = await supabase.rpc("find_member_by_email", {
      lookup_email: q.toLowerCase()
    });
    if (rpcError) {
      if (isMissingRelation(rpcError.message)) return { people: [], error: rpcError.message };
      return { people: [], error: rpcError.message };
    }
    if (!peerId) return { people: [] };
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, photo_url, trueverse_id, username, trust_score")
      .eq("id", peerId)
      .eq("is_disabled", false)
      .maybeSingle();
    if (error) return { people: [], error: error.message };
    return { people: data ? [asPeer(data as MessagePeer)] : [] };
  }

  const term = sanitizeSearchTerm(q);
  if (!term) return { people: [] };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, photo_url, trueverse_id, username, trust_score")
    .eq("is_disabled", false)
    .neq("id", viewerId)
    .or(`full_name.ilike.%${term}%,trueverse_id.ilike.%${term}%,username.ilike.%${term}%`)
    .limit(12);

  if (error) return { people: [], error: error.message };
  return { people: ((data ?? []) as MessagePeer[]).map(asPeer) };
}
