/**
 * Future product surfaces — architecture only.
 * Do not implement messaging, marketplace, groups, events product,
 * business profiles, or the AI assistant in this sprint.
 */
export const FUTURE_SURFACES = [
  {
    id: "messaging",
    path: "/messages",
    label: "Messaging",
    status: "planned" as const
  },
  {
    id: "marketplace",
    path: "/marketplace",
    label: "Marketplace",
    status: "planned" as const
  },
  {
    id: "groups",
    path: "/groups",
    label: "Groups",
    status: "planned" as const
  },
  {
    id: "events",
    path: "/events",
    label: "Events",
    status: "planned" as const
  },
  {
    id: "business_profiles",
    path: "/business",
    label: "Business Profiles",
    status: "planned" as const
  },
  {
    id: "ai_assistant",
    path: "/assistant",
    label: "AI Assistant",
    status: "planned" as const
  }
] as const;

export type FutureSurfaceId = (typeof FUTURE_SURFACES)[number]["id"];
