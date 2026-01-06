import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import InviteConfirm from "./components/InviteConfirm";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = (await searchParams).token;

  if (!token) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Ungültiger Einladungslink</h1>
        <p className="text-gray-500 mt-2">Kein Token gefunden.</p>
      </div>
    );
  }

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Einladung ungültig</h1>
        <p className="text-gray-500 mt-2">
          Die Einladung ist abgelaufen oder wurde bereits benutzt.
        </p>
      </div>
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const userExists = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (userExists) {
      redirect(
        `/sign-in?token=${token}&email=${encodeURIComponent(invite.email)}`,
      );
    }

    redirect(
      `/sign-up?token=${token}&email=${encodeURIComponent(invite.email)}`,
    );
  }

  const existingMembership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });

  if (existingMembership) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Bereits Mitglied</h1>
        <p className="text-gray-500 mt-2">
          Ihr Konto gehört bereits zu einer Organisation.
        </p>
      </div>
    );
  }

  return <InviteConfirm token={token} />;
}
