import {
  filterConversations,
  sortConversations,
  type ChatMessage,
  type ConversationView,
  type MessagePeer
} from "@/lib/messages";
import { currentUser } from "@/lib/dummy-data";

export const MOCK_MESSENGER_VIEWER_ID = currentUser.id;

type DirectoryPerson = MessagePeer & { email: string };

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export const mockMessagePeople: DirectoryPerson[] = [
  {
    id: "mock-jordan",
    full_name: "Jordan Hale",
    photo_url: null,
    trueverse_id: "tv_jordanhale",
    username: "jordanhale",
    trust_score: 72,
    email: "jordan@trueverse.app"
  },
  {
    id: "mock-priya",
    full_name: "Priya Nair",
    photo_url: null,
    trueverse_id: "tv_priyanair",
    username: "priyanair",
    trust_score: 88,
    email: "priya@trueverse.app"
  },
  {
    id: "mock-marcus",
    full_name: "Marcus Chen",
    photo_url: null,
    trueverse_id: "tv_marcuschen",
    username: "marcuschen",
    trust_score: 54,
    email: "marcus@trueverse.app"
  },
  {
    id: "mock-lena",
    full_name: "Lena Ortiz",
    photo_url: null,
    trueverse_id: "tv_lenaortiz",
    username: "lenaortiz",
    trust_score: 41,
    email: "lena@trueverse.app"
  },
  {
    id: "mock-noah",
    full_name: "Noah Okonkwo",
    photo_url: null,
    trueverse_id: "tv_noahok",
    username: "noahok",
    trust_score: 63,
    email: "noah@trueverse.app"
  },
  {
    id: "mock-amira",
    full_name: "Amira Solis",
    photo_url: null,
    trueverse_id: "tv_amirasolis",
    username: "amirasolis",
    trust_score: 79,
    email: "amira@trueverse.app"
  }
];

function asPeer(person: DirectoryPerson): MessagePeer {
  return {
    id: person.id,
    full_name: person.full_name,
    photo_url: person.photo_url,
    trueverse_id: person.trueverse_id,
    username: person.username,
    trust_score: person.trust_score
  };
}

export function searchMockPeople(query: string): MessagePeer[] {
  const q = query.trim().toLowerCase().replace(/^@/, "");
  if (!q) return [];
  return mockMessagePeople
    .filter((person) => {
      if (q.includes("@")) return person.email.toLowerCase() === q;
      return (
        person.full_name.toLowerCase().includes(q) ||
        person.trueverse_id.toLowerCase().includes(q) ||
        (person.username ?? "").toLowerCase().includes(q)
      );
    })
    .map(asPeer);
}

export function seedMockConversations(): ConversationView[] {
  const jordan = asPeer(mockMessagePeople[0]);
  const priya = asPeer(mockMessagePeople[1]);
  const marcus = asPeer(mockMessagePeople[2]);

  return sortConversations([
    {
      id: "conv-jordan",
      peer: jordan,
      last_message: "I can cover the Saturday shift if that still helps.",
      last_message_at: minutesAgo(18),
      unread_count: 0,
      peer_last_read_at: hoursAgo(5)
    },
    {
      id: "conv-priya",
      peer: priya,
      last_message: "Thank you — the pantry drop-off went smoothly.",
      last_message_at: hoursAgo(6),
      unread_count: 2,
      peer_last_read_at: minutesAgo(40)
    },
    {
      id: "conv-marcus",
      peer: marcus,
      last_message: "See you at the west gate at 4.",
      last_message_at: hoursAgo(30),
      unread_count: 0,
      peer_last_read_at: hoursAgo(28)
    }
  ]);
}

export function seedMockMessages(): Record<string, ChatMessage[]> {
  return {
    "conv-jordan": [
      {
        id: "m-j-1",
        conversation_id: "conv-jordan",
        sender_id: MOCK_MESSENGER_VIEWER_ID,
        body: "Hi Jordan — still looking for a driver for the Saturday pantry run?",
        image_url: null,
        created_at: hoursAgo(8),
        seen: true
      },
      {
        id: "m-j-2",
        conversation_id: "conv-jordan",
        sender_id: "mock-jordan",
        body: "Yes. Two hours, westside route. I can take the early window.",
        image_url: null,
        created_at: hoursAgo(7),
        seen: false
      },
      {
        id: "m-j-3",
        conversation_id: "conv-jordan",
        sender_id: MOCK_MESSENGER_VIEWER_ID,
        body: "That would be a huge help. I’ll confirm the list tonight.",
        image_url: null,
        created_at: hoursAgo(6),
        seen: true
      },
      {
        id: "m-j-4",
        conversation_id: "conv-jordan",
        sender_id: "mock-jordan",
        body: "Perfect. I’ll bring extra crates.",
        image_url: null,
        created_at: minutesAgo(22),
        seen: false
      },
      {
        id: "m-j-5",
        conversation_id: "conv-jordan",
        sender_id: "mock-jordan",
        body: "I can cover the Saturday shift if that still helps.",
        image_url: null,
        created_at: minutesAgo(18),
        seen: false
      }
    ],
    "conv-priya": [
      {
        id: "m-p-1",
        conversation_id: "conv-priya",
        sender_id: "mock-priya",
        body: "The westside pantry is short on rice this week.",
        image_url: null,
        created_at: hoursAgo(10),
        seen: false
      },
      {
        id: "m-p-2",
        conversation_id: "conv-priya",
        sender_id: MOCK_MESSENGER_VIEWER_ID,
        body: "I can drop a few bags after work. Thank you for flagging it.",
        image_url: null,
        created_at: hoursAgo(7),
        seen: true
      },
      {
        id: "m-p-3",
        conversation_id: "conv-priya",
        sender_id: "mock-priya",
        body: "Thank you — the pantry drop-off went smoothly.",
        image_url: null,
        created_at: hoursAgo(6),
        seen: false
      }
    ],
    "conv-marcus": [
      {
        id: "m-c-1",
        conversation_id: "conv-marcus",
        sender_id: MOCK_MESSENGER_VIEWER_ID,
        body: "Marcus, are we still meeting at the west gate?",
        image_url: null,
        created_at: hoursAgo(32),
        seen: true
      },
      {
        id: "m-c-2",
        conversation_id: "conv-marcus",
        sender_id: "mock-marcus",
        body: "See you at the west gate at 4.",
        image_url: null,
        created_at: hoursAgo(30),
        seen: false
      }
    ]
  };
}

export function filterMockConversations(items: ConversationView[], query: string) {
  return filterConversations(items, query);
}
