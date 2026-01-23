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
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );
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
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
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
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 },
      );
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
        { error: "Einladung nicht gefunden oder bereits verarbeitet" },
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
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}
