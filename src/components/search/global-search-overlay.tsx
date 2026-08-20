"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { Briefcase, Calendar, Hash, Search, Sparkles, UserRound, Users, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  POPULAR_SEARCHES,
  SEARCH_EMPTY_COPY,
  SEARCH_KINDS,
  type SearchHit,
  type SearchKind
} from "@/lib/search";
import { groupedMockSearch } from "@/lib/search-mock";
import { cn } from "@/lib/utils";

const RECENT_KEY = "trueverse.recent-searches";
const KIND_META: Record<SearchKind, { label: string; icon: typeof Search }> = {
  member: { label: "Members", icon: UserRound },
  passport: { label: "Passports", icon: UserRound },
  post: { label: "Posts", icon: FileText },
  community: { label: "Communities", icon: Users },
  event: { label: "Events", icon: Calendar },
  business: { label: "Businesses", icon: Briefcase }
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
  const [active, setActive] = useState(0);

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
    }, 80);
    return () => window.clearTimeout(timer);
  }, [trimmed, local]);

  const hits = local && trimmed ? groupedMockSearch(trimmed).flatMap((group) => group.items) : remoteHits;

  const groups = useMemo(() => {
    const visibleHits = trimmed.length < 1 ? [] : hits;
    return SEARCH_KINDS.map((kind) => ({ kind, items: visibleHits.filter((hit) => hit.kind === kind) })).filter(
      (group) => group.items.length > 0
    );
  }, [hits, trimmed]);

  const flatHits = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  const remember = useCallback((value: string) => {
    setRecent((current) => {
      const next = [value, ...current.filter((item) => item !== value)].slice(0, 8);
      writeRecent(next);
      return next;
    });
  }, []);

  function onInputKey(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, Math.max(flatHits.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && flatHits[active]) {
      event.preventDefault();
      remember(query.trim());
      window.location.assign(flatHits[active].href);
    }
  }

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
          <Search className="size-4 shrink-0 text-foreground/70" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search members, communities or reputation."
            className="h-11 border-0 bg-transparent text-base text-foreground shadow-none ring-0 placeholder:text-foreground/55 focus-visible:ring-0 dark:bg-transparent"
            aria-label="Search"
            aria-autocomplete="list"
          />
          <Button type="button" size="icon-sm" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {query.trim().length < 1 ? (
            <div className="space-y-5">
              {recent.length ? (
                <div>
                  <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-foreground/70">
                    Recent searches
                  </p>
                  <ul className="space-y-1">
                    {recent.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted/70"
                          onClick={() => setQuery(item)}
                        >
                          <Hash className="size-3.5 text-foreground/70" />
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="px-3 pt-4 text-center text-sm leading-6 text-foreground/80">
                  {SEARCH_EMPTY_COPY}
                </p>
              )}
              <div>
                <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-foreground/70">
                  Popular searches
                </p>
                <ul className="flex flex-wrap gap-1.5 px-1">
                  {POPULAR_SEARCHES.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-brand-soft hover:text-brand"
                        onClick={() => setQuery(item)}
                      >
                        <Sparkles className="size-3" />
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : loading && hits.length === 0 ? (
            <div className="space-y-2 p-2" aria-busy="true" aria-label="Loading search results">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-2xl bg-foreground/15" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-foreground/80">
              No matches for “{query.trim()}”. Try a name, Trueverse ID, or community.
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const meta = KIND_META[group.kind];
                const Icon = meta.icon;
                return (
                  <section key={group.kind}>
                    <p className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wide text-foreground/70">
                      <Icon className="size-3.5" />
                      {meta.label}
                    </p>
                    <ul className="space-y-1" role="listbox">
                      {group.items.map((hit) => {
                        const index = flatHits.findIndex((item) => item.id === hit.id);
                        return (
                          <li key={hit.id}>
                            <Link
                              href={hit.href}
                              role="option"
                              aria-selected={index === active}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-muted/70",
                                index === active && "bg-muted/80"
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
                                <span className="block truncate font-mono text-[11px] text-foreground/70">
                                  {hit.subtitle}
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
        <p className="border-t border-border/60 px-4 py-2 text-[11px] text-foreground/70">
          <kbd className="rounded-md bg-muted px-1.5 py-0.5 font-mono">⌘K</kbd> open ·{" "}
          <kbd className="rounded-md bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> close ·{" "}
          <kbd className="rounded-md bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd> move ·{" "}
          <kbd className="rounded-md bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> open
        </p>
      </div>
    </div>
  );
}
