import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
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
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }

    return NextResponse.json({
      canSendEmail: organization?.mailjet?.isEnabled || false,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: t("internalServerError"),
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
