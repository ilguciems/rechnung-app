import { headers } from "next/headers";
import { NextResponse } from "next/server";
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
          },
        },
      },
      select: {
        mailjet: {
          select: {
            isEnabled: true,
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

    return NextResponse.json({
      canSendEmail: organization?.mailjet?.isEnabled || false,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Interner Serverfehler",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
