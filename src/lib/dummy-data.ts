import type { AdminReport, HelpRequest, PositiveInteraction, Profile } from "@/lib/types";

export const currentUser: Profile = {
  id: "user-aria",
  email: "aria@trueverse.app",
  full_name: "Aria Morgan",
  photo_url: null,
  bio: "Neighborhood organizer, volunteer driver, and mutual-aid coordinator. I use Trueverse to build accountable local trust.",
  trust_score: 86,
  streak: 14,
  trueverse_id: "tv_ariamorgan",
  role: "member",
  is_disabled: false,
  last_positive_at: "2026-06-24T18:20:00Z",
  created_at: "2026-01-12T10:00:00Z",
  updated_at: "2026-06-24T18:20:00Z"
};

export const profiles: Profile[] = [
  currentUser,
  {
    id: "user-maya",
    email: "maya@example.com",
    full_name: "Maya Chen",
    photo_url: null,
    bio: "Community responder helping neighbors with errands, translation, and late-night check-ins.",
    trust_score: 94,
    streak: 27,
    trueverse_id: "tv_mayachen",
    role: "member",
    is_disabled: false,
    last_positive_at: "2026-06-25T07:30:00Z",
    created_at: "2025-12-02T09:00:00Z",
    updated_at: "2026-06-25T07:30:00Z"
  },
  {
    id: "user-omar",
    email: "omar@example.com",
    full_name: "Omar Patel",
    photo_url: null,
    bio: "Repair volunteer and weekend food pantry coordinator.",
    trust_score: 78,
    streak: 8,
    trueverse_id: "tv_omarpatel",
    role: "member",
    is_disabled: false,
    last_positive_at: "2026-06-23T12:15:00Z",
    created_at: "2026-02-18T12:00:00Z",
    updated_at: "2026-06-23T12:15:00Z"
  },
  {
    id: "user-lena",
    email: "lena@example.com",
    full_name: "Lena Brooks",
    photo_url: null,
    bio: "Admin reviewer focused on fair evidence review and dispute resolution.",
    trust_score: 91,
    streak: 19,
    trueverse_id: "tv_lenabrooks",
    role: "admin",
    is_disabled: false,
    last_positive_at: "2026-06-22T14:45:00Z",
    created_at: "2025-11-20T08:30:00Z",
    updated_at: "2026-06-22T14:45:00Z"
  }
];

export const interactions: PositiveInteraction[] = [
  {
    id: "interaction-ride-home",
    author_id: "user-aria",
    recipient_id: "user-maya",
    title: "Safe ride after community event",
    description:
      "Aria coordinated rides for three volunteers after the mutual-aid meetup and confirmed everyone arrived safely.",
    status: "accepted",
    accepted_at: "2026-06-24T18:20:00Z",
    rejected_at: null,
    expires_at: "2026-07-08T18:20:00Z",
    created_at: "2026-06-24T17:05:00Z",
    updated_at: "2026-06-24T18:20:00Z"
  },
  {
    id: "interaction-grocery-run",
    author_id: "user-omar",
    recipient_id: "user-aria",
    title: "Delivered groceries to an elder",
    description:
      "Omar completed a grocery run during heavy rain and sent a clear receipt and delivery confirmation.",
    status: "pending",
    accepted_at: null,
    rejected_at: null,
    expires_at: "2026-07-03T16:00:00Z",
    created_at: "2026-06-25T16:00:00Z",
    updated_at: "2026-06-25T16:00:00Z"
  },
  {
    id: "interaction-tool-return",
    author_id: "user-maya",
    recipient_id: "user-omar",
    title: "Returned borrowed repair tools",
    description:
      "Maya returned a borrowed drill kit on time, cleaned, and with replacement bits included.",
    status: "accepted",
    accepted_at: "2026-06-23T12:15:00Z",
    rejected_at: null,
    expires_at: "2026-07-07T12:15:00Z",
    created_at: "2026-06-23T11:25:00Z",
    updated_at: "2026-06-23T12:15:00Z"
  }
];

export const helpRequests: HelpRequest[] = [
  {
    id: "request-pantries",
    author_id: "user-maya",
    title: "Need two volunteers for pantry sorting",
    description:
      "Looking for trusted helpers to sort produce boxes before Saturday distribution. Gloves and instructions provided.",
    location: "Mission District",
    is_open: true,
    created_at: "2026-06-25T09:30:00Z",
    updated_at: "2026-06-25T09:30:00Z",
    closed_at: null,
    profiles: {
      full_name: "Maya Chen",
      photo_url: null,
      trust_score: 94,
      trueverse_id: "tv_mayachen"
    },
    community_responses: [
      {
        id: "response-1",
        request_id: "request-pantries",
        author_id: "user-aria",
        message: "I can cover the first sorting shift and bring labels.",
        is_hidden: false,
        created_at: "2026-06-25T10:10:00Z",
        profiles: {
          full_name: "Aria Morgan",
          photo_url: null,
          trust_score: 86,
          trueverse_id: "tv_ariamorgan"
        }
      }
    ]
  },
  {
    id: "request-translation",
    author_id: "user-omar",
    title: "Spanish translation for tenant clinic",
    description:
      "A tenant-rights clinic needs a Spanish speaker for intake forms and follow-up notes tomorrow evening.",
    location: "Civic Center",
    is_open: true,
    created_at: "2026-06-24T15:45:00Z",
    updated_at: "2026-06-24T15:45:00Z",
    closed_at: null,
    profiles: {
      full_name: "Omar Patel",
      photo_url: null,
      trust_score: 78,
      trueverse_id: "tv_omarpatel"
    },
    community_responses: []
  },
  {
    id: "request-bike",
    author_id: "user-aria",
    title: "Borrow a cargo bike for supply drop",
    description:
      "Need a cargo bike for a two-hour supply drop route. Happy to coordinate pickup and return windows.",
    location: "Hayes Valley",
    is_open: true,
    created_at: "2026-06-23T19:20:00Z",
    updated_at: "2026-06-23T19:20:00Z",
    closed_at: null,
    profiles: {
      full_name: "Aria Morgan",
      photo_url: null,
      trust_score: 86,
      trueverse_id: "tv_ariamorgan"
    },
    community_responses: [
      {
        id: "response-2",
        request_id: "request-bike",
        author_id: "user-maya",
        message: "You can borrow mine if you can return it before 6 PM.",
        is_hidden: false,
        created_at: "2026-06-23T20:05:00Z",
        profiles: {
          full_name: "Maya Chen",
          photo_url: null,
          trust_score: 94,
          trueverse_id: "tv_mayachen"
        }
      }
    ]
  }
];

export const adminReports: AdminReport[] = [
  {
    id: "report-missed-dropoff",
    reporter_id: "user-maya",
    reported_user_id: "user-omar",
    title: "Missed agreed supply drop-off",
    description:
      "Reporter says the volunteer confirmed pickup but did not arrive or communicate for four hours. Evidence includes chat transcript and timestamped pickup log.",
    evidence_url: "https://example.com/evidence/dropoff-thread.pdf",
    status: "pending",
    reviewed_by: null,
    admin_notes: null,
    reviewed_at: null,
    created_at: "2026-06-25T08:15:00Z",
    updated_at: "2026-06-25T08:15:00Z",
    reporter: {
      full_name: "Maya Chen",
      trueverse_id: "tv_mayachen",
      trust_score: 94
    },
    reported_user: {
      full_name: "Omar Patel",
      trueverse_id: "tv_omarpatel",
      trust_score: 78
    }
  },
  {
    id: "report-dispute-receipt",
    reporter_id: "user-omar",
    reported_user_id: "user-aria",
    title: "Receipt mismatch under review",
    description:
      "Admin needs to compare uploaded receipt photos against the agreed reimbursement amount before resolving.",
    evidence_url: "https://example.com/evidence/receipt-photos.zip",
    status: "disputed",
    reviewed_by: "user-lena",
    admin_notes: "Awaiting one more screenshot from reporter.",
    reviewed_at: "2026-06-24T12:00:00Z",
    created_at: "2026-06-23T15:00:00Z",
    updated_at: "2026-06-24T12:00:00Z",
    reporter: {
      full_name: "Omar Patel",
      trueverse_id: "tv_omarpatel",
      trust_score: 78
    },
    reported_user: {
      full_name: "Aria Morgan",
      trueverse_id: "tv_ariamorgan",
      trust_score: 86
    }
  }
];

export const dashboardMetrics = [
  { label: "Trust score", value: "86", detail: "+9 this month" },
  { label: "Current streak", value: "14", detail: "days of verified help" },
  { label: "Pending reviews", value: "3", detail: "2 incoming, 1 admin" },
  { label: "Community rank", value: "Top 8%", detail: "local network" }
];

export const trustTimeline = [
  { title: "Positive interaction accepted", delta: "+3", date: "Today", tone: "positive" },
  { title: "Help request response", delta: "0", date: "Yesterday", tone: "neutral" },
  { title: "Report dismissed after review", delta: "0", date: "Jun 21", tone: "neutral" },
  { title: "Positive interaction accepted", delta: "+3", date: "Jun 19", tone: "positive" }
];
