import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  DEFAULT_AUTHED_REDIRECT,
  isAuthRoute,
  isPrivateRoute,
  resolveNextPath
} from "@/lib/routes";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // IMPORTANT: getUser() also refreshes the session; keep it before any redirect
  // so refreshed auth cookies are carried onto the redirect response below.
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Gate private routes: send unauthenticated users to login and remember where
  // they were headed so they can be returned there after signing in.
  if (!user && isPrivateRoute(pathname)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return redirectPreservingCookies(loginUrl, response);
  }

  // Keep authenticated users out of the login/signup pages.
  if (user && isAuthRoute(pathname)) {
    let targetPath = resolveNextPath(request.nextUrl.searchParams.get("next"));
    if (targetPath === pathname) {
      targetPath = DEFAULT_AUTHED_REDIRECT;
    }
    return redirectPreservingCookies(new URL(targetPath, request.url), response);
  }

  return response;
}

// Redirect while preserving any refreshed Supabase auth cookies set on `source`.
function redirectPreservingCookies(url: URL, source: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}
