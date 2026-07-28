// Central definition of which routes require authentication and where users go
// after logging in. Shared by the middleware (edge), server components, and the
// client auth forms so route protection stays consistent in one place.

// Pages that require an authenticated user. A path matches if it equals the
// prefix or is nested under it (e.g. "/interactions/create").
export const PRIVATE_ROUTE_PREFIXES = ["/profile", "/interactions", "/admin"] as const;

// Auth pages that a signed-in user should be bounced away from.
export const AUTH_ROUTES = ["/auth/login", "/auth/signup"] as const;

// Where to send a user after login/signup when no explicit destination is given.
export const DEFAULT_AUTHED_REDIRECT = "/profile";

export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

// Only allow same-origin, absolute internal paths as post-login redirects to
// avoid open-redirect attacks (e.g. "//evil.com" or "https://evil.com").
export function sanitizeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/")) {
    return null;
  }

  if (next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }

  return next;
}

// Resolve a safe post-login destination, falling back to the default page.
export function resolveNextPath(next: string | null | undefined): string {
  return sanitizeNextPath(next) ?? DEFAULT_AUTHED_REDIRECT;
}
