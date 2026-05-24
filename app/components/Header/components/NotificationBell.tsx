"use client";
import { useAtom } from "jotai";
import { Bell, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks";
import { notificationsAtom, unreadCountAtom } from "@/store/notifications";

export function NotificationBell() {
  const t = useTranslations("notifications");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const unreadCount = useAtom(unreadCountAtom)[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  useOnClickOutside(containerRef, () => {
    if (!containerRef.current) return;
    setIsOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  });

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleClear = () => {
    setNotifications([]);
    setIsOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        aria-label={
          unreadCount > 0
            ? t("bellLabel", { count: unreadCount })
            : t("bellLabelEmpty")
        }
        ref={buttonRef}
        onClick={handleOpen}
        className="relative cursor-pointer rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus-visible:outline-gray-300"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white dark:ring-gray-800"
          >
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-modal="false"
          aria-label={t("listLabel")}
          className="absolute -right-32 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {t("title")}
            </h3>
            {notifications.length > 0 && (
              <button
                type="button"
                aria-label={t("clearAll")}
                onClick={handleClear}
                className="cursor-pointer text-xs text-gray-400 transition-colors hover:text-black dark:text-gray-500 dark:hover:text-gray-200"
              >
                <span className="flex gap-0.5">
                  {t("clearAllButton")}
                  <X className="w-4 h-4" />
                </span>
              </button>
            )}
          </div>

          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
                {t("empty")}
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-gray-50 p-4 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/60 ${!n.isRead ? "bg-blue-50/30 dark:bg-blue-950/30" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium leading-tight text-gray-800 dark:text-gray-100">
                      {n.title}
                    </p>
                    <span className="ml-2 whitespace-nowrap text-[10px] text-gray-400 dark:text-gray-500">
                      {new Date(n.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {n.description}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
