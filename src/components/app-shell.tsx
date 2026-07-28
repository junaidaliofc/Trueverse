import Link from "next/link";
import { currentUser } from "@/lib/dummy-data";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/feed", label: "Feed" },
  { href: "/interactions/create", label: "Create" },
  { href: "/interactions/interaction-ride-home", label: "Detail" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" }
];

export function AppShell({
  children
}: {
  children: React.ReactNode;
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

          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-teal-700">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <Link href="/auth/login" className="hidden font-semibold text-slate-700 hover:text-teal-700 sm:inline">
              Sign in
            </Link>
            <Link
              href="/profile"
              className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 font-semibold text-teal-800"
            >
              {currentUser.trueverse_id}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
