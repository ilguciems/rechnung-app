/**
 * CSRF guard for state-changing route handlers.
 *
 * Browsers attach `Origin` to cross-site POSTs, so a mismatch means the request
 * was issued by another site. A missing `Origin` cannot come from a third-party
 * page (curl, server-to-server calls), so it is not a CSRF vector.
 */
export function isAllowedRequestOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");

  if (!origin) return true;

  const configured = [
    process.env.APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
  ].flatMap((value) => {
    if (!value) return [];

    try {
      return [new URL(value).origin];
    } catch {
      return [];
    }
  });

  if (configured.includes(origin)) return true;

  const host = req.headers.get("host");
  if (!host) return false;

  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.slice(0, -1);

  return origin === `${proto}://${host}`;
}
