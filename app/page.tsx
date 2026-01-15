import { redirect } from "next/navigation";
import { getAuthData } from "@/lib/get-auth-data";
import { prisma } from "@/lib/prisma-client";
import { GLOBAL_ADMIN_ROLES, type GlobalRole } from "@/types/global-roles";
import { MainPage } from "./components";

export default async function Home() {
  const session = await getAuthData();

  if (!session) redirect("/sign-in");

  if (
    session?.user?.role &&
    GLOBAL_ADMIN_ROLES.includes(session.user.role as GlobalRole)
  ) {
    redirect("/admin");
  }

  const membership = session.org;

  let hasPendingInvite = false;

  if (!membership) {
    const invite = await prisma.organizationInvite.findFirst({
      where: {
        email: session.user.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    hasPendingInvite = !!invite;
  }
  return (
    <MainPage
      hasPendingInvite={hasPendingInvite}
      userName={session.user.name}
    />
  );
}
