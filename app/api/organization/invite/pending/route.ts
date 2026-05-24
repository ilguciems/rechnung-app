import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  const t = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }

    const invites = await prisma.organizationInvite.findMany({
      where: {
        organizationId: organization.id,
        acceptedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
      },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }
    return NextResponse.json(
      { error: t("internalServerError") },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const t2 = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t2("unauthorized") }, { status: 401 });
    }

    const { invitationId } = z
      .object({
        invitationId: z.string(),
      })
      .parse(await req.json());

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: t2("noPermission") }, { status: 403 });
    }

    const invite = await prisma.organizationInvite.findFirst({
      where: {
        id: invitationId,
        organizationId: organization.id,
        acceptedAt: null,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: t2("invitationNotFound") },
        { status: 404 },
      );
    }

    await prisma.organizationInvite.delete({
      where: { id: invite.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t2("databaseError") }, { status: 400 });
    }
    return NextResponse.json(
      { error: t2("internalServerError") },
      { status: 500 },
    );
  }
}
