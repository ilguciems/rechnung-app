import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export type formats = {
  date?: Record<string, Intl.DateTimeFormatOptions>;
  time?: Record<string, Intl.DateTimeFormatOptions>;
  dateTime?: Record<string, Intl.DateTimeFormatOptions>;
  number?: Record<string, Intl.NumberFormatOptions>;
};

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = (cookieLocale as "de" | "en") || "de";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    formats: {
      date: {
        short: { day: "numeric", month: "short", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
      },
      time: {
        short: { hour: "numeric", minute: "numeric" },
        long: { hour: "numeric", minute: "numeric", second: "numeric" },
      },
      dateTime: {
        short: {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        },
        long: {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        },
      },
      number: {
        currency: { style: "currency", currency: "EUR" },
        percent: { style: "percent", minimumFractionDigits: 1 },
        decimal: { style: "decimal", minimumFractionDigits: 2 },
      },
    },
  };
});
