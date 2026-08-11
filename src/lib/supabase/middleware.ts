import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/interactions",
  "/notifications",
  "/missions",
  "/badges",
  "/community",
  "/activity",
  "/admin"
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (!url || !anon) {
    if (isProtected) {
      const login = new URL("/auth/login", request.url);
      login.searchParams.set("error", "Authentication is not configured.");
      login.searchParams.set("next", path);
      return NextResponse.redirect(login);
    }
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  if (user && (path === "/auth/login" || path === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
