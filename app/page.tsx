import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { MainPage } from "./components";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });

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
    <MainPage hasPendingInvite={hasPendingInvite} user={session.user.name} />
  );
}
