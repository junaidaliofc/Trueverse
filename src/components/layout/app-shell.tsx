"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  Home,
  LayoutDashboard,
  Menu,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { currentUser } from "@/lib/dummy-data";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/activity", label: "Activity", icon: Sparkles },
  { href: "/missions", label: "Missions", icon: Trophy },
  { href: "/community", label: "Community", icon: Users },
  { href: "/profile", label: "Profile", icon: Award }
];

const secondaryNav = [
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/badges", label: "Badges" },
  { href: "/notifications", label: "Notifications" },
  { href: "/insights", label: "Insights" },
  { href: "/interactions", label: "Interactions" },
  { href: "/feed", label: "Help Feed" },
  { href: "/admin", label: "Admin" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMarketing = pathname === "/" || pathname.startsWith("/auth");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {!isMarketing ? (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
            ) : null}
            <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm">
                <Shield className="size-4" aria-hidden />
              </span>
              <span>Trueverse</span>
            </Link>
          </div>

          {!isMarketing ? (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {primaryNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-brand-soft text-brand"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
              <a href="#how-it-works" className="hover:text-foreground">
                How it works
              </a>
              <a href="#trust" className="hover:text-foreground">
                Trust
              </a>
              <Link href="/auth/login" className="hover:text-foreground">
                Sign in
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isMarketing ? (
              <Link
                href="/notifications"
                className="inline-flex size-10 items-center justify-center rounded-2xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </Link>
            ) : null}
            {isMarketing ? (
              <Link
                href="/auth/signup"
                className="hidden rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground sm:inline-flex"
              >
                Get started
              </Link>
            ) : (
              <Link href="/profile" className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-2 py-1.5 pr-3">
                <Avatar name={currentUser.full_name} src={currentUser.photo_url} size="sm" />
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                  {currentUser.trueverse_id}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-surface-elevated p-5 shadow-2xl animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg font-bold">Menu</p>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">
              {[...primaryNav, ...secondaryNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold",
                    pathname === item.href ? "bg-brand-soft text-brand" : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <main
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          isMarketing ? "py-0 pb-16" : "pb-24 pt-8 lg:pb-10"
        )}
      >
        {children}
      </main>

      {!isMarketing ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl lg:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1 py-3 text-[10px] font-semibold",
                      active ? "text-brand" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
