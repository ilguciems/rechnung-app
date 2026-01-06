import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json(null);
  }

  return NextResponse.json({ name: organization.name });
}

export async function PATCH(req: Request) {
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
}
