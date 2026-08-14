export type CompletionTaskId =
  | "email"
  | "photo"
  | "bio"
  | "location"
  | "skills"
  | "communities"
  | "trust_act"
  | "identity";

export type CompletionTask = {
  id: CompletionTaskId;
  label: string;
  href: string;
  done: boolean;
  optional?: boolean;
  future?: boolean;
};

export type ProfileCompletion = {
  percent: number;
  tasks: CompletionTask[];
  complete: boolean;
};

export function buildProfileCompletion(flags: {
  email: boolean;
  photo: boolean;
  bio: boolean;
  location?: boolean;
  skills?: boolean;
  communities?: boolean;
  trustAct: boolean;
  identity?: boolean;
  /** @deprecated Sprint 7 aliases mapped by callers */
  name?: boolean;
  communityPost?: boolean;
  appreciation?: boolean;
  joinCommunity?: boolean;
  followFive?: boolean;
}): ProfileCompletion {
  const tasks: CompletionTask[] = [
    { id: "email", label: "Verified Email", href: "/auth/verify", done: flags.email },
    { id: "photo", label: "Profile Photo", href: "/profile", done: flags.photo },
    { id: "bio", label: "Biography", href: "/profile", done: flags.bio },
    {
      id: "location",
      label: "Location",
      href: "/profile",
      done: Boolean(flags.location),
      optional: true
    },
    { id: "skills", label: "Skills", href: "/profile", done: Boolean(flags.skills) },
    {
      id: "communities",
      label: "Communities Joined",
      href: "/community/discover",
      done: Boolean(flags.communities ?? flags.joinCommunity)
    },
    {
      id: "trust_act",
      label: "First Positive Trust Act",
      href: "/interactions/create",
      done: flags.trustAct
    },
    {
      id: "identity",
      label: "Identity Verification",
      href: "/trust",
      done: Boolean(flags.identity),
      future: true
    }
  ];
  const required = tasks.filter((task) => !task.optional && !task.future);
  const done = required.filter((task) => task.done).length;
  const percent = Math.round((done / required.length) * 100);
  return { percent, tasks, complete: percent === 100 };
}

export const ONBOARDING_STEPS = [
  {
    id: "passport",
    title: "Passport",
    body: "Your Passport is the public story of who you are — name, photo, and verified identity. It is not a scoreboard.",
    href: "/passport"
  },
  {
    id: "trust",
    title: "Trust",
    body: "Trust comes from real help, recorded as Trust Acts. Likes, streaks, and XP never raise Trust.",
    href: "/interactions/create"
  },
  {
    id: "communities",
    title: "Communities",
    body: "Find a calm group — neighborhood, volunteering, or a book club — and show up as yourself.",
    href: "/community/discover"
  },
  {
    id: "messaging",
    title: "Messaging",
    body: "Direct messages stay between people. They never change Trust Score.",
    href: "/messages"
  },
  {
    id: "privacy",
    title: "Privacy",
    body: "You choose what the neighborhood sees. Sensitive reports stay out of public Passport views.",
    href: "/profile"
  },
  {
    id: "profile",
    title: "Complete profile",
    body: "Add a photo, your name, and a short bio so neighbors can recognize you.",
    href: "/profile"
  }
] as const;

export function shouldShowOnboarding(completion: ProfileCompletion, createdAt: string) {
  if (completion.complete) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const missingCore = completion.tasks
    .filter((task) => ["photo", "bio", "email"].includes(task.id))
    .some((task) => !task.done);
  return missingCore || (ageMs < sevenDays && completion.percent < 55);
}
