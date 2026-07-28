import Link from "next/link";
import type { Profile } from "@/lib/types";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/interactions", label: "Interactions" },
  { href: "/feed", label: "Feed" },
  { href: "/admin", label: "Admin" }
];

export function AppShell({
  children,
  profile
}: {
  children: React.ReactNode;
  profile: Profile | null;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-950">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-teal-600 text-white">
              T
            </span>
            <span>Trueverse</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-teal-700">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {profile ? (
              <>
                <Link
                  href="/profile"
                  className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 font-semibold text-teal-800"
                >
                  {profile.trueverse_id}
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="font-semibold text-slate-700 hover:text-teal-700"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-semibold text-slate-700 hover:text-teal-700">
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
