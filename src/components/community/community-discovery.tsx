"use client";

import { useMemo, useState } from "react";
import { MapPin, Users } from "lucide-react";
import {
  ALL_DISCOVER_TOPICS,
  DISCOVER_TOPICS,
  communitiesForTopic,
  type DiscoverTopic
} from "@/lib/communities";
import { Button } from "@/components/ui/button";
import { chipClass } from "@/lib/ui";

export function CommunityDiscovery({
  initialTopic
}: {
  initialTopic?: string;
}) {
  const start =
    ALL_DISCOVER_TOPICS.find((item) => item.toLowerCase() === initialTopic?.toLowerCase()) ??
    "Suggested";
  const [topic, setTopic] = useState<DiscoverTopic>(start);
  const communities = useMemo(() => communitiesForTopic(topic), [topic]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Featured</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Communities
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-foreground/80">
          Calm groups for neighborhoods, volunteering, and shared work. Location is optional.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {DISCOVER_TOPICS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTopic(item)}
            className={chipClass(topic === item)}
          >
            {item}
          </button>
        ))}
      </div>

      {communities.length === 0 ? (
        <div className="glass-elevated rounded-[1.75rem] px-5 py-12 text-center">
          <p className="font-display text-lg font-bold">No communities in this topic yet</p>
          <p className="mt-2 text-sm text-foreground/80">Try Trending or Suggested.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {communities.map((community) => (
            <li key={community.id} className="glass-elevated rounded-[1.6rem] p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                {community.topic}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground">
                {community.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/80">{community.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground/75">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" />
                  {community.members} members
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {community.place}
                </span>
              </div>
              <Button type="button" size="sm" className="mt-4">
                Join
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
