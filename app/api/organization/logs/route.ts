import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getAuthData } from "@/lib/get-auth-data";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  const t = await getTranslations("apiErrors");
  const session = await getAuthData();

  if (!session?.org || session.org.role !== "admin") {
    return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
  }

  const logs = await prisma.activityLog.findMany({
    where: {
      organizationId: session.org?.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (logs) {
    return NextResponse.json(logs);
  }
  return NextResponse.json([]);
}
