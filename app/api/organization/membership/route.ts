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

    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        role: "admin",
      },
      include: {
        organization: {
          include: {
            members: {
              select: {
                role: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership?.organization) {
      return NextResponse.json(
        { error: t("noOrganizationFound") },
        { status: 404 },
      );
    }

    return NextResponse.json(membership.organization.members);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }

    return NextResponse.json({ error: t("loadingError") }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const t = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }

    const { userId, role } = z
      .object({
        userId: z.string(),
        role: z.enum(["admin", "member"]),
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
      include: {
        members: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Keine Organisation gefunden bzw. keine Berechtigung" },
        { status: 403 },
      );
    }

    const targetMember = organization.members.find(
      (member) => member.userId === userId,
    );

    if (!targetMember) {
      return NextResponse.json(
        { error: "Kein Mitglied gefunden" },
        { status: 404 },
      );
    }

    if (targetMember.userId === organization.ownerId) {
      return NextResponse.json(
        { error: t("roleCannotChange") },
        { status: 403 },
      );
    }

    await prisma.organizationMember.update({
      where: {
        id: targetMember.id,
      },
      data: {
        role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }

    return NextResponse.json({ error: t("loadingError") }, { status: 500 });
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

    const { userId } = z
      .object({
        userId: z.string(),
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
      include: {
        members: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: t2("noOrganizationOrPermission") },
        { status: 403 },
      );
    }

    const targetMember = organization.members.find(
      (member) => member.userId === userId,
    );

    if (!targetMember) {
      return NextResponse.json({ error: t2("noMemberFound") }, { status: 404 });
    }

    if (targetMember.userId === organization.ownerId) {
      return NextResponse.json(
        { error: t2("roleCannotDelete") },
        { status: 403 },
      );
    }

    await prisma.organizationMember.delete({
      where: {
        id: targetMember.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t2("databaseError") }, { status: 400 });
    }

    return NextResponse.json({ error: t2("loadingError") }, { status: 500 });
  }
}
