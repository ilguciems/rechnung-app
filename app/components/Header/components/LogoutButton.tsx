"use client";
import { LogOut } from "lucide-react";
import { useTimer } from "@/context/TimerContext";

export function LogoutButton({ title }: { title?: string }) {
  const { handleLogout } = useTimer();
  const onLogoutClick = async () => {
    await handleLogout("manual");
  };

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      className="p-2 cursor-pointer rounded-full bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 dark:bg-gray-900 flex items-center justify-between gap-2 transition-colors duration-300"
      onClick={onLogoutClick}
    >
      <span className="pl-2 text-sm text-black dark:text-gray-100">
        {title}
      </span>
      <LogOut className="w-6 h-6 shrink-0 dark:text-gray-100" />
    </button>
  );
}
