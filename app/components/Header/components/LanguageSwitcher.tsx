"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getClientCookie, setClientCookie } from "@/lib/client-cookie";

export function LanguageSwitcher() {
  const t = useTranslations("header");
  const router = useRouter();
  const [language, setLanguage] = useState("de");

  useEffect(() => {
    const cookieLocale = getClientCookie("NEXT_LOCALE");
    const locale = cookieLocale || "de";
    if (cookieLocale) {
      setLanguage(locale);
    } else {
      const browserLocale = navigator.language.split("-")[0];
      setLanguage(browserLocale);
      setClientCookie("NEXT_LOCALE", browserLocale);
      router.refresh();
    }
  }, [router]);

  return (
    <button
      type="button"
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-10 h-10 flex items-center justify-center text-sm text-black dark:text-white"
      aria-label={t("switchLanguage")}
      onClick={() => {
        const newLocale = language === "en" ? "de" : "en";
        setClientCookie("NEXT_LOCALE", newLocale);
        setLanguage(newLocale);
        router.refresh();
      }}
    >
      {language.toUpperCase()}
    </button>
  );
}
