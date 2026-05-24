"use client";
import { useTranslations } from "next-intl";
import { useTimer } from "@/context/TimerContext";

export function HeaderTimer() {
  const { timeLeft, WARNING_TIME } = useTimer();
  const t = useTranslations("header.headerTimer");

  if (timeLeft === null || timeLeft <= WARNING_TIME) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[12px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 dark:bg-green-400" />
      <span>
        {t("session")}: {hours > 0 ? `${hours}${t("hours")}` : ""}
        {minutes}
        {t("minutes")}
      </span>
    </div>
  );
}
