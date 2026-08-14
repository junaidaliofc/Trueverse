"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, Hash, Search, UserRound, Users, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SEARCH_EMPTY_COPY, type SearchHit, type SearchKind } from "@/lib/search";
import { groupedMockSearch } from "@/lib/search-mock";
import { cn } from "@/lib/utils";

const RECENT_KEY = "trueverse.recent-searches";
const KIND_META: Record<SearchKind, { label: string; icon: typeof Search }> = {
  member: { label: "Members", icon: UserRound },
  passport: { label: "Passport Profiles", icon: UserRound },
  post: { label: "Community Posts", icon: FileText },
  community: { label: "Communities", icon: Users },
  event: { label: "Events", icon: Calendar }
};

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: string[]) {
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 8)));
}

export function GlobalSearchOverlay({
  onClose,
  local = false
}: {
  onClose: () => void;
  local?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [remoteHits, setRemoteHits] = useState<SearchHit[]>([]);
  const [recent, setRecent] = useState(readRecent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const trimmed = query.trim();

  useEffect(() => {
    if (local || trimmed.length < 1) return;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const payload = (await response.json()) as { hits?: SearchHit[] };
        setRemoteHits(payload.hits ?? []);
      } catch {
        setRemoteHits([]);
      } finally {
        setLoading(false);
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [trimmed, local]);

  const hits = local && trimmed ? groupedMockSearch(trimmed).flatMap((group) => group.items) : remoteHits;

  const groups = useMemo(() => {
    const visibleHits = trimmed.length < 1 ? [] : hits;
    const kinds: SearchKind[] = ["member", "passport", "post", "community", "event"];
    return kinds
      .map((kind) => ({ kind, items: visibleHits.filter((hit) => hit.kind === kind) }))
      .filter((group) => group.items.length > 0);
  }, [hits, trimmed]);

  const remember = useCallback((value: string) => {
    setRecent((current) => {
      const next = [value, ...current.filter((item) => item !== value)].slice(0, 8);
      writeRecent(next);
      return next;
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 py-8 sm:px-6 sm:py-16">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Trueverse"
        className="glass-elevated relative z-10 flex max-h-[min(36rem,80dvh)] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem]"
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search members, communities or reputation."
            className="h-11 border-0 bg-transparent text-base shadow-none ring-0 focus-visible:ring-0 dark:bg-transparent"
            aria-label="Search"
          />
          <Button type="button" size="icon-sm" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {query.trim().length < 1 ? (
            recent.length ? (
              <div>
                <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Recent
                </p>
                <ul className="space-y-1">
                  {recent.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm hover:bg-muted/70"
                        onClick={() => setQuery(item)}
                      >
                        <Hash className="size-3.5 text-muted-foreground" />
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">{SEARCH_EMPTY_COPY}</p>
            )
          ) : loading && hits.length === 0 ? (
            <div className="space-y-2 p-2" aria-hidden>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-2xl bg-foreground/10" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              No matches for “{query.trim()}”.
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const meta = KIND_META[group.kind];
                const Icon = meta.icon;
                return (
                  <section key={group.kind}>
                    <p className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      <Icon className="size-3.5" />
                      {meta.label}
                    </p>
                    <ul className="space-y-1">
                      {group.items.map((hit) => (
                        <li key={hit.id}>
                          <Link
                            href={hit.href}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-muted/70"
                            )}
                            onClick={() => {
                              remember(query.trim());
                              onClose();
                            }}
                          >
                            {hit.kind === "member" || hit.kind === "passport" ? (
                              <UserAvatar name={hit.title} src={hit.photo_url} size="sm" />
                            ) : (
                              <span className="flex size-8 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                <Icon className="size-3.5" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {hit.title}
                              </span>
                              <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                {hit.subtitle}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
