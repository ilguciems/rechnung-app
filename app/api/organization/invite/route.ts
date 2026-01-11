import crypto from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { sendAuthorizationEmail } from "@/utils/authorization-email";
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Nicht authorisiert" }, { status: 401 });
  }

  const { email, role } = await req.json();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true },
  });

  if (existingUser?.memberships.length) {
    return NextResponse.json(
      { error: "Benutzer ist bereits in einer Organisation" },
      { status: 400 },
    );
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      role: "admin",
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Kein Administrator" }, { status: 403 });
  }

  const token = crypto.randomUUID();

  await prisma.organizationInvite.create({
    data: {
      email,
      role,
      token,
      organizationId: membership.organizationId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
    },
  });

  const inviteUrl = `${process.env.APP_URL}/organization/invite?token=${token}`;

  const organizationName = await prisma.organization
    .findFirst({
      where: {
        id: membership.organizationId,
      },
    })
    .then((organization) => organization?.name || "");

  await sendAuthorizationEmail({
    to: email,
    subject: `Treten Sie ${organizationName ? organizationName : "Ihrer Organisation"} bei Rechnung App bei.`,
    text: `Sie wurden eingeladen, einer Organisation beizutreten.\n\nKlicken Sie hier:\n${inviteUrl}`,
  });

  return NextResponse.json({ ok: true });
}
