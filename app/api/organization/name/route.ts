import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

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
      select: {
        name: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );
    }

    return NextResponse.json({ name: organization.name });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({ name });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
