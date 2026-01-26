"use client";
import { LogOut } from "lucide-react";
import { useTimer } from "@/context/TimerContext";

export function LogoutButton() {
  const { handleLogout } = useTimer();
  const onLogoutClick = async () => {
    await handleLogout("manual");
  };

  return (
    <button
      type="button"
      aria-label="Logout"
      title="Abmelden"
      className="p-2 cursor-pointer rounded-full bg-gray-200 hover:bg-gray-300 flex items-center gap-1 transition-colors duration-300"
      onClick={onLogoutClick}
    >
      <span className="pl-2 text-sm text-black hidden sm:block">Abmelden</span>
      <LogOut color="black" className="w-6 h-6" />
    </button>
  );
}
