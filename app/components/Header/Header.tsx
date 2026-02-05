import { Activity, BookText, ShieldUser, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { getAuthData } from "@/lib/get-auth-data";
import { GLOBAL_ADMIN_ROLES, type GlobalRole } from "@/types/global-roles";
import { ORG_ADMIN_ROLES, type OrgRole } from "@/types/org-roles";

import { HeaderTimer, LogoutButton, NavLink, NavLinkGuard } from "./components";

export default async function Header() {
  const session = await getAuthData();
  const isGlobalAdmin = GLOBAL_ADMIN_ROLES.includes(
    session?.user?.role as GlobalRole,
  );
  const isOrgAdmin = ORG_ADMIN_ROLES.includes(session?.org?.role as OrgRole);
  const orgId = session?.org?.id;

  return (
    <header className="sticky top-0 z-[200]">
      <nav className="flex justify-between items-center px-4 py-2 bg-gray-100 min-h-[56px] z-[200] shadow-xl">
        <Link href="/">
          <h1 className="text-2xl font-bold flex items-center hover:underline">
            I<Activity />
            voice
          </h1>
        </Link>
        {session && (
          <div className="flex items-center gap-2">
            <HeaderTimer />
            <NavLinkGuard serverOrgId={orgId}>
              {orgId && (
                <NavLink
                  href={`/`}
                  title="Rechnungen"
                  icon={<BookText />}
                  text="Rechnungen"
                />
              )}
            </NavLinkGuard>
            <NavLink
              href={`/profile/${session.user.id}`}
              title={`Profile von ${session.user.name}`}
              icon={<UserRoundCog />}
              text="Profile"
            />
            {isGlobalAdmin && (
              <NavLink
                href="/admin"
                title="Admin"
                icon={<ShieldUser />}
                text="Admin"
              />
            )}
            <NavLinkGuard serverOrgId={orgId}>
              {isOrgAdmin && (
                <NavLink
                  href={`/organization/${orgId}/admin`}
                  title="Admin"
                  icon={<ShieldUser />}
                  text="Admin"
                />
              )}
            </NavLinkGuard>
            <LogoutButton />
          </div>
        )}
      </nav>
    </header>
  );
}
