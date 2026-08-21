"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, ShieldCheck, UserRound } from "lucide-react";
import { SessionAvatar } from "@/components/auth/session-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const appNav = [
  { href: "/dashboard", label: "Trust Center", icon: ShieldCheck },
  { href: "/check", label: "Check", icon: Search },
  { href: "/notifications", label: "Requests", icon: Bell },
  { href: "/profile", label: "My Passport", icon: UserRound }
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
            <nav className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm">
                <Link href="/check">Check Someone</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Create Passport</Link>
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
          <ul
            className="mx-auto grid max-w-lg px-1 safe-bottom"
            style={{ gridTemplateColumns: `repeat(${appNav.length}, minmax(0, 1fr))` }}
          >
            {appNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1 py-2.5 text-center text-[10px] font-semibold leading-tight transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
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
