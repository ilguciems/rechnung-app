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
      className="p-2 cursor-pointer bg-black rounded-full hover:bg-gray-800 flex items-center gap-1 "
      onClick={onLogoutClick}
    >
      <span className="pl-2 text-sm text-white hidden sm:block">Abmelden</span>
      <LogOut color="white" className="w-6 h-6" />
    </button>
  );
}
