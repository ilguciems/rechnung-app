"use client";
import { useAtom } from "jotai";
import { Bell, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks";
import { notificationsAtom, unreadCountAtom } from "@/store/notifications";

export function NotificationBell() {
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
        aria-label={`Mitteilungen ${unreadCount > 0 ? `(${unreadCount} ungelesen)` : ""}`}
        ref={buttonRef}
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white"
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
          aria-label="Mitteilungs-Liste"
          className="absolute -right-32 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Mitteilungen</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                aria-label="Alle Mitteilungen löschen"
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-black transition-colors cursor-pointer"
              >
                <span className="flex gap-0.5">
                  Alle löschen <X className="w-4 h-4" />
                </span>
              </button>
            )}
          </div>

          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-8 text-center text-gray-400 text-sm">
                Keine neue Mitteilungen
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50/30" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800 font-medium leading-tight">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                      {new Date(n.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{n.description}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
