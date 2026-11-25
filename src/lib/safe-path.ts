/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative URLs, schemes, and encoded tricks.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) {
    return fallback;
  }

  let value = next.trim();

  try {
    value = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  value = value.trim();

  if (!value.startsWith("/")) {
    return fallback;
  }

  if (value.startsWith("//") || value.includes("\\") || value.includes("\n") || value.includes("\r")) {
    return fallback;
  }

  if (value.includes("://")) {
    return fallback;
  }

  return value;
}
