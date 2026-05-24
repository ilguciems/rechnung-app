import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = cookieLocale || "de";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
