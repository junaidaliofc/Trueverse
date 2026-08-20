import type { Profile } from "@/lib/types";

export type SuggestionReason = "community" | "location" | "interests" | "mutual_trust";

export type SuggestedPerson = {
  profile: Profile;
  reason: SuggestionReason;
  reasonLabel: string;
};

const LABELS: Record<SuggestionReason, string> = {
  community: "Same community",
  location: "Nearby",
  interests: "Shared interests",
  mutual_trust: "Mutual trust connection"
};

export function suggestPeople(people: Profile[], viewer?: Profile | null): SuggestedPerson[] {
  const others = people.filter((person) => person.id !== viewer?.id);
  const viewerInterests = new Set((viewer?.interests ?? []).map((item) => item.toLowerCase()));

  return others.slice(0, 8).map((profile, index) => {
    const shared = (profile.interests ?? []).some((item) => viewerInterests.has(item.toLowerCase()));
    const reason: SuggestionReason = shared
      ? "interests"
      : index % 4 === 0
        ? "community"
        : index % 4 === 1
          ? "mutual_trust"
          : index % 4 === 2
            ? "interests"
            : "location";
    return { profile, reason, reasonLabel: LABELS[reason] };
  });
}
