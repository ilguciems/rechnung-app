import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );
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
        { error: "Keine Organisation gefunden" },
        { status: 404 },
      );
    }

    return NextResponse.json(membership.organization.members);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );
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
        { error: "Diese Rolle kann nicht geändert werden" },
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
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );
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
        { error: "Diese Rolle kann nicht gelöscht werden" },
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
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}
