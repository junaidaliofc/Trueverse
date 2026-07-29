"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  Home,
  Menu,
  Shield,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import { currentUser } from "@/lib/dummy-data";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/activity", label: "Activity", icon: Sparkles },
  { href: "/missions", label: "Missions", icon: Trophy },
  { href: "/community", label: "Community", icon: Users },
  { href: "/profile", label: "Profile", icon: Award }
];

const secondaryNav = [
  { href: "/design-system", label: "Design system" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/badges", label: "Badges" },
  { href: "/notifications", label: "Notifications" },
  { href: "/insights", label: "Insights" },
  { href: "/admin", label: "Admin" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing =
    pathname === "/" || pathname.startsWith("/auth") || pathname === "/design-system";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-2">
            {!isMarketing ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(20rem,88vw)] p-0">
                  <SheetHeader className="border-b border-border px-5 py-4 text-left">
                    <SheetTitle className="font-display text-lg">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 p-3">
                    {[...primaryNav, ...secondaryNav].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm font-semibold",
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                            ? "bg-brand-soft text-brand"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            ) : null}

            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight"
            >
              <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
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
              <Link href="/design-system" className="hover:text-foreground">
                Design system
              </Link>
              <Link href="/auth/login" className="hover:text-foreground">
                Sign in
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {!isMarketing ? (
              <Link
                href="/notifications"
                className="inline-flex size-11 items-center justify-center rounded-2xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </Link>
            ) : null}
            {isMarketing ? (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/signup">Get started</Link>
              </Button>
            ) : (
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-1.5 py-1.5 pr-3"
              >
                <UserAvatar name={currentUser.full_name} src={currentUser.photo_url} size="sm" />
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                  {currentUser.trueverse_id}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto max-w-6xl px-4 sm:px-6",
          isMarketing ? "pb-16 pt-0" : "pb-28 pt-6 sm:pt-8 lg:pb-12"
        )}
      >
        {children}
      </main>

      {!isMarketing ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl lg:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 safe-bottom">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold",
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
