"use client";
import { Activity, ShieldUser, UserRoundCog } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks";
import { HeaderTimer, LogoutButton } from "./components";

export default function Header() {
  const { session, isLoading, isGlobalAdmin, isOrgAdmin, orgId } = useAuth();

  return (
    <nav className="flex justify-between items-center px-4 py-2 bg-gray-100 z-[200] sticky top-0 min-h-[56px] shadow-xl">
      <Link href="/">
        <h1 className="text-2xl font-bold flex items-center hover:underline">
          I<Activity />
          voice
        </h1>
      </Link>
      {session && !isLoading && (
        <div className="flex items-center gap-2">
          <HeaderTimer />
          <Link
            className="p-2 cursor-pointer bg-black rounded-full hover:bg-gray-800 flex items-center gap-1"
            href={`/profile/${session.user.id}`}
            title={`Profile von ${session.user.name}`}
          >
            <span className="pl-2 text-sm text-white hidden sm:block">
              Profile
            </span>
            <UserRoundCog color="white" className="w-6 h-6" />
          </Link>
          {isGlobalAdmin && (
            <Link
              className="p-2 cursor-pointer bg-black rounded-full hover:bg-gray-800 flex items-center gap-1"
              href="/admin"
              title="Admin"
            >
              <span className="pl-2 text-sm text-white hidden sm:block">
                Admin
              </span>
              <ShieldUser color="white" className="w-6 h-6" />
            </Link>
          )}
          {isOrgAdmin && (
            <Link
              className="p-2 cursor-pointer bg-black rounded-full hover:bg-gray-800 flex items-center gap-1"
              href={`/organization/${orgId}/admin`}
              title="Admin"
            >
              <span className="pl-2 text-sm text-white hidden sm:block">
                Admin
              </span>
              <ShieldUser color="white" className="w-6 h-6" />
            </Link>
          )}
          <LogoutButton />
        </div>
      )}
    </nav>
  );
}
