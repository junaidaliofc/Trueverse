"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, MessageCircle, UserRound, Users } from "lucide-react";
import { currentUser } from "@/lib/dummy-data";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const appNav: Array<{
  href: string;
  label: string;
  icon: typeof Home;
  soon?: boolean;
}> = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/profile", label: "Passport", icon: UserRound },
  { href: "/community", label: "Community", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/messages", label: "Messages", icon: MessageCircle, soon: true }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing =
    pathname === "/" || pathname.startsWith("/auth") || pathname === "/design-system";

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
          </Link>

          {!isMarketing ? (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {appNav.map((item) => {
                const active =
                  !item.soon &&
                  (pathname === item.href || pathname.startsWith(`${item.href}/`));
                if (item.soon) {
                  return (
                    <span
                      key={item.href}
                      className="rounded-2xl px-3.5 py-2 text-sm font-semibold text-muted-foreground/50"
                      title="Coming soon"
                    >
                      {item.label}
                    </span>
                  );
                }
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
              <Link href="/profile" className="rounded-2xl p-1 transition hover:bg-muted">
                <UserAvatar name={currentUser.full_name} src={currentUser.photo_url} size="sm" />
              </Link>
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
          <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 safe-bottom">
            {appNav.map((item) => {
              const Icon = item.icon;
              const active =
                !item.soon &&
                (pathname === item.href || pathname.startsWith(`${item.href}/`));

              if (item.soon) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold text-muted-foreground/45"
                    >
                      <Icon className="size-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition-colors",
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
