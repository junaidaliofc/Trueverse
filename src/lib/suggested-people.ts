import type { Profile } from "@/lib/types";

export type SuggestionReason = "community" | "interests" | "nearby" | "joined";

export type SuggestedPerson = {
  profile: Profile;
  reason: SuggestionReason;
  reasonLabel: string;
};

export function suggestPeople(people: Profile[], viewer?: Profile | null): SuggestedPerson[] {
  const others = people.filter((person) => person.id !== viewer?.id);
  return others.slice(0, 8).map((profile, index) => {
    const reason: SuggestionReason =
      index % 4 === 0
        ? "joined"
        : index % 4 === 1
          ? "community"
          : index % 4 === 2
            ? "interests"
            : "nearby";
    const reasonLabel =
      reason === "joined"
        ? "Recently joined"
        : reason === "community"
          ? "Same community"
          : reason === "interests"
            ? "Similar interests"
            : "Nearby · coming soon";
    return { profile, reason, reasonLabel };
  });
}
