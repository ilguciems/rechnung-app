import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import type { Prisma } from "@/app/generated/prisma/client";
import { getAuthData } from "@/lib/get-auth-data";
import { prisma } from "@/lib/prisma-client";
import { validateQuery } from "@/lib/validateQuery";

const DEFAULT_PAGE_SIZE = 20;

const querySchema = z.object({
  cursor: z.string().optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
});

type Cursor = { createdAt: Date; id: string };

const parseCursor = (cursor?: string): Cursor | null => {
  const [createdAt, id] = cursor?.split("|") ?? [];
  const date = createdAt ? new Date(createdAt) : null;

  if (!date || Number.isNaN(date.getTime()) || !id) return null;

  return { createdAt: date, id };
};

const toCursor = ({ createdAt, id }: Cursor) =>
  `${createdAt.toISOString()}|${id}`;

export async function GET(req: Request) {
  const t = await getTranslations("apiErrors");
  const session = await getAuthData();

  if (session?.org?.role !== "admin") {
    return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
  }

  const organizationId = session.org.id;

  return validateQuery(req, querySchema, async ({ cursor, pageSize }) => {
    const after = parseCursor(cursor);

    const where: Prisma.ActivityLogWhereInput = {
      organizationId,
      ...(after
        ? {
            OR: [
              { createdAt: { lt: after.createdAt } },
              { createdAt: after.createdAt, id: { lt: after.id } },
            ],
          }
        : {}),
    };

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: pageSize + 1,
    });

    const data = logs.slice(0, pageSize);
    const last = data.at(-1);

    return NextResponse.json({
      data,
      nextCursor: logs.length > pageSize && last ? toCursor(last) : null,
    });
  });
}
