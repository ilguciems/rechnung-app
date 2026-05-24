import { Activity, BookText, ShieldUser, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAuthData } from "@/lib/get-auth-data";
import { GLOBAL_ADMIN_ROLES, type GlobalRole } from "@/types/global-roles";
import { ORG_ADMIN_ROLES, type OrgRole } from "@/types/org-roles";

import {
  HeaderTimer,
  LanguageSwitcher,
  LogoutButton,
  MobileMenu,
  NavLink,
  NavLinkGuard,
  NotificationBell,
  ThemeToggle,
} from "./components";

export default async function Header() {
  const session = await getAuthData();
  const isGlobalAdmin = GLOBAL_ADMIN_ROLES.includes(
    session?.user?.role as GlobalRole,
  );
  const isOrgAdmin = ORG_ADMIN_ROLES.includes(session?.org?.role as OrgRole);
  const orgId = session?.org?.id;
  const t = await getTranslations("header");

  return (
    <header className="sticky top-0 z-200">
      <nav className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 min-h-14 z-200 shadow-xl">
        <Link href="/">
          <h1 className="text-2xl font-bold flex items-center hover:underline">
            I<Activity />
            voice
          </h1>
        </Link>
        {!session && (
          <span className="flex items-center gap-2">
            <ThemeToggle /> <LanguageSwitcher />
          </span>
        )}
        {session && (
          <div className="flex items-center gap-2">
            <HeaderTimer />
            <NotificationBell />
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <NavLinkGuard serverOrgId={orgId}>
                {orgId && (
                  <NavLink
                    href={`/`}
                    title={t("invoices")}
                    icon={<BookText />}
                    text={t("invoices")}
                  />
                )}
              </NavLinkGuard>
              <NavLink
                href={`/profile/${session.user.id}`}
                title={t("profile")}
                icon={<UserRoundCog />}
                text={t("profile")}
              />
              {isGlobalAdmin && (
                <NavLink
                  href="/admin"
                  title={t("admin")}
                  icon={<ShieldUser />}
                  text={t("admin")}
                />
              )}
              <NavLinkGuard serverOrgId={orgId}>
                {isOrgAdmin && (
                  <NavLink
                    href={`/organization/${orgId}/admin`}
                    title={t("admin")}
                    icon={<ShieldUser />}
                    text={t("admin")}
                  />
                )}
              </NavLinkGuard>
              <LogoutButton title={t("logout")} />
            </div>
            <LanguageSwitcher />
            <MobileMenu>
              <NavLinkGuard serverOrgId={orgId}>
                {orgId && (
                  <NavLink
                    href={`/`}
                    title={t("invoices")}
                    icon={<BookText />}
                    text={t("invoices")}
                  />
                )}
              </NavLinkGuard>
              <NavLink
                href={`/profile/${session.user.id}`}
                title={t("profile")}
                icon={<UserRoundCog />}
                text={t("profile")}
              />
              {isGlobalAdmin && (
                <NavLink
                  href="/admin"
                  title={t("admin")}
                  icon={<ShieldUser />}
                  text={t("admin")}
                />
              )}
              <NavLinkGuard serverOrgId={orgId}>
                {isOrgAdmin && (
                  <NavLink
                    href={`/organization/${orgId}/admin`}
                    title={t("admin")}
                    icon={<ShieldUser />}
                    text={t("admin")}
                  />
                )}
              </NavLinkGuard>
              <LogoutButton title={t("logout")} />
            </MobileMenu>
          </div>
        )}
      </nav>
    </header>
  );
}
