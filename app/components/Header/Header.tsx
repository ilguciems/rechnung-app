"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useTimer } from "@/context/TimerContext";
import { useSession } from "@/lib/auth-client";
import { HeaderTimer } from "./components";

export default function Header() {
  const { handleLogout } = useTimer();
  const { data: session } = useSession();

  const onLogoutClick = async () => {
    await handleLogout("manual");
  };

  return (
    <nav className="flex justify-between items-center px-4 py-2 bg-gray-100 z-50 sticky top-0">
      <Link href="/">
        <h1 className="text-2xl font-bold">Invoice App</h1>
      </Link>
      {session && (
        <div className="flex items-center gap-2">
          <HeaderTimer />
          <Link
            className="text-sm hover:underline"
            href={`/profile/${session.user.id}`}
          >
            {session.user.name}
          </Link>
          {session.user.role === "admin" && (
            <Link className="text-sm hover:underline" href="/admin">
              Admin
            </Link>
          )}
          <button
            type="button"
            aria-label="Logout"
            title="Auslogen"
            className="p-2 cursor-pointer bg-black rounded-full hover:bg-gray-800"
            onClick={onLogoutClick}
          >
            <LogOut color="white" className="w-6 h-6" />
          </button>
        </div>
      )}
    </nav>
  );
}
