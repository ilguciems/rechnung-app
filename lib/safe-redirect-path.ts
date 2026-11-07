/**
 * Turns a URL-sourced redirect target into a same-origin relative path.
 *
 * `callbackUrl` and friends are attacker-controlled: a crafted link such as
 * `/sign-in?callbackUrl=https://evil.example` would otherwise send the user to
 * another site right after a successful sign-in. Anything that is not a
 * relative path on this origin falls back to `fallback`.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;

  let decoded: string;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  // Must stay on this origin: reject absolute URLs and protocol-relative
  // forms such as //evil.example, and backslashes, which browsers normalize
  // into slashes and would turn into the same protocol-relative redirect.
  if (!decoded.startsWith("/")) return fallback;
  if (/^\/[\\/]/.test(decoded)) return fallback;
  if (decoded.includes("\\")) return fallback;

  return decoded;
}
