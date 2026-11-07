/**
 * Date formatting shared by client components that are rendered on the server
 * too. Passing the locale and the time zone explicitly keeps the server output
 * and the browser output identical, so hydration does not mismatch; without
 * them each side uses its own defaults (the container runs in UTC with an
 * en-US locale, the browser in Europe/Berlin with de-DE).
 */
const LOCALE = "de-DE";
const TIME_ZONE = "Europe/Berlin";

type DateInput = string | number | Date;

export function formatDate(value: DateInput): string {
  return new Date(value).toLocaleDateString(LOCALE, { timeZone: TIME_ZONE });
}

export function formatDateTime(value: DateInput): string {
  return new Date(value).toLocaleString(LOCALE, { timeZone: TIME_ZONE });
}
