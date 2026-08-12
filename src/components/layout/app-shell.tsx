"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, MessageCircle, UserRound, Users } from "lucide-react";
import { SessionAvatar } from "@/components/auth/session-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const appNav = [
  { href: "/dashboard", label: "Home", icon: Home, soon: false },
  { href: "/passport", label: "Passport", icon: UserRound, soon: false },
  { href: "/community", label: "Community", icon: Users, soon: false },
  { href: "/messages", label: "Messages", icon: MessageCircle, soon: true },
  { href: "/notifications", label: "Alerts", icon: Bell, soon: false }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname === "/design-system";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/65 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4 sm:h-16 sm:max-w-6xl sm:px-6">
          <Link
            href={isMarketing ? "/" : "/dashboard"}
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-sm text-primary-foreground sm:size-9 sm:rounded-2xl">
              T
            </span>
            <span className={cn(isMarketing ? "inline" : "hidden sm:inline")}>Trueverse</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
              Beta
            </span>
          </Link>

          {!isMarketing ? (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {appNav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-brand-soft text-brand"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {item.soon ? (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </nav>
          )}

          {!isMarketing ? (
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <SessionAvatar />
            </div>
          ) : null}
        </div>
      </header>

      <main
        className={cn(
          "mx-auto px-4 sm:px-6",
          isMarketing
            ? "max-w-6xl pb-10 pt-0"
            : "max-w-lg pb-28 pt-5 sm:max-w-6xl sm:pb-12 sm:pt-8"
        )}
      >
        {children}
      </main>

      {!isMarketing ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-xl lg:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-5 px-0.5 safe-bottom">
            {appNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex min-h-12 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-[10px] font-semibold transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                    <span className="leading-none">{item.label}</span>
                    {item.soon ? (
                      <span className="absolute right-1 top-1 rounded-full bg-muted px-1 text-[8px] font-bold uppercase text-muted-foreground">
                        Soon
                      </span>
                    ) : null}
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
