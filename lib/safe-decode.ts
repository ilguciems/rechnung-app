/**
 * `decodeURIComponent` throws `URIError` on a malformed percent-escape, which a
 * crafted link can trigger (`?email=100%`). The values passed here already came
 * out of `URLSearchParams`, so the fallback keeps the readable original instead
 * of dropping the value.
 */
export function safeDecodeURIComponent(
  value: string | null | undefined,
): string {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
