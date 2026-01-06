import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.emailVerified) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailVerified: true },
    });
  }

  const { token } = await req.json();

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
  }

  const existingMembership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });

  if (existingMembership) {
    return NextResponse.json(
      { error: "User already in organization" },
      { status: 400 },
    );
  }

  if (invite.email !== session.user.email) {
    return NextResponse.json(
      { error: "Invite email mismatch" },
      { status: 403 },
    );
  }

  await prisma.$transaction([
    prisma.organizationMember.create({
      data: {
        userId: session.user.id,
        organizationId: invite.organizationId,
        role: invite.role,
      },
    }),
    prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
