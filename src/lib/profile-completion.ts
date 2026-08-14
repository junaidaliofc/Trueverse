export type CompletionTaskId =
  | "photo"
  | "name"
  | "bio"
  | "email"
  | "trust_act"
  | "community_post"
  | "appreciation"
  | "join_community"
  | "follow_five";

export type CompletionTask = {
  id: CompletionTaskId;
  label: string;
  href: string;
  done: boolean;
};

export type ProfileCompletion = {
  percent: number;
  tasks: CompletionTask[];
  complete: boolean;
};

export function buildProfileCompletion(flags: {
  photo: boolean;
  name: boolean;
  bio: boolean;
  email: boolean;
  trustAct: boolean;
  communityPost: boolean;
  appreciation: boolean;
  joinCommunity: boolean;
  followFive: boolean;
}): ProfileCompletion {
  const tasks: CompletionTask[] = [
    { id: "photo", label: "Profile photo", href: "/profile", done: flags.photo },
    { id: "name", label: "Full name", href: "/profile", done: flags.name },
    { id: "bio", label: "Bio", href: "/profile", done: flags.bio },
    { id: "email", label: "Email verified", href: "/auth/verify", done: flags.email },
    { id: "trust_act", label: "First Trust Act", href: "/interactions/create", done: flags.trustAct },
    {
      id: "community_post",
      label: "First Community Post",
      href: "/community",
      done: flags.communityPost
    },
    { id: "appreciation", label: "First Appreciation", href: "/community", done: flags.appreciation },
    { id: "join_community", label: "Join Community", href: "/community/discover", done: flags.joinCommunity },
    { id: "follow_five", label: "Follow 5 Members", href: "/community", done: flags.followFive }
  ];
  const done = tasks.filter((task) => task.done).length;
  const percent = Math.round((done / tasks.length) * 100);
  return { percent, tasks, complete: percent === 100 };
}

export const ONBOARDING_STEPS = [
  {
    id: "photo",
    title: "Upload profile photo",
    body: "A clear photo helps neighbors recognize you.",
    href: "/profile"
  },
  {
    id: "email",
    title: "Verify email",
    body: "Confirm the address on your Passport.",
    href: "/auth/verify"
  },
  {
    id: "profile",
    title: "Complete profile",
    body: "Add your name and a short bio.",
    href: "/profile"
  },
  {
    id: "trust",
    title: "Record first Trust Act",
    body: "Recognize someone who actually helped.",
    href: "/interactions/create"
  },
  {
    id: "community",
    title: "Join community",
    body: "Find a neighborhood group and say hello.",
    href: "/community/discover"
  }
] as const;

export function shouldShowOnboarding(completion: ProfileCompletion, createdAt: string) {
  if (completion.complete) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const missingCore = completion.tasks
    .filter((task) => ["photo", "name", "bio", "email"].includes(task.id))
    .some((task) => !task.done);
  return missingCore || (ageMs < sevenDays && completion.percent < 55);
}
