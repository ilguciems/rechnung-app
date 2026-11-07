import {
  addMonths,
  differenceInDays,
  format,
  isBefore,
  subDays,
} from "date-fns";
import { de } from "date-fns/locale";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getAuthData } from "@/lib/get-auth-data";
import { prisma } from "@/lib/prisma-client";
import {
  DEFAULT_STATS_RANGE,
  isStatsRange,
  resolveStatsRange,
} from "@/lib/stats-range";

export async function GET(request: Request) {
  const t = await getTranslations("apiErrors");
  try {
    const session = await getAuthData();
    if (!session?.org?.companyId)
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const requestedRange = searchParams.get("range");
    const range = isStatsRange(requestedRange)
      ? requestedRange
      : DEFAULT_STATS_RANGE;

    const companyId = session.org.companyId;
    const now = new Date();
    const { start, end, monthCount } = resolveStatsRange(range, now);

    const invoices = await prisma.invoice.findMany({
      where: { companyId, createdAt: { gte: start, lt: end } },
      include: { items: { select: { unitPrice: true, quantity: true } } },
    });

    const monthlyData = new Map<
      string,
      { monthKey: string; month: string; revenue: number; pending: number }
    >();
    for (let i = 0; i < monthCount; i++) {
      const date = addMonths(start, i);
      const monthKey = format(date, "yyyy-MM");
      monthlyData.set(monthKey, {
        monthKey,
        month: format(date, "MMM", { locale: de }).replace(/\.$/, ""),
        revenue: 0,
        pending: 0,
      });
    }
    const stats = invoices.reduce(
      (acc, inv) => {
        const total = inv.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        const bucket = monthlyData.get(format(inv.createdAt, "yyyy-MM"));

        if (inv.isPaid) {
          acc.totalRevenue += total;
          if (bucket) bucket.revenue += total;
        } else {
          acc.pendingAmount += total;
          if (bucket) bucket.pending += total;

          if (inv.invoiceSentAt) {
            const dueDate = subDays(now, 30);
            const isInitialOverdue = isBefore(inv.invoiceSentAt, dueDate);
            const daysSinceSent = differenceInDays(now, inv.invoiceSentAt);
            const isDueSoon = daysSinceSent >= 16 && daysSinceSent <= 30;

            const lastReminder =
              inv.thirdReminderSentAt ||
              inv.secondReminderSentAt ||
              inv.firstReminderSentAt;

            const isReminderOverdue =
              lastReminder && isBefore(lastReminder, subDays(now, 14));

            const daysSinceReminder = lastReminder
              ? differenceInDays(now, lastReminder)
              : null;

            const isReminderDueSoon =
              daysSinceReminder !== null &&
              daysSinceReminder >= 7 &&
              daysSinceReminder <= 14;

            if (isInitialOverdue || isReminderOverdue) {
              acc.overdueAmount += total;
            }

            if (isDueSoon || isReminderDueSoon) {
              acc.expectedNext14Days += total;
            }
          }
        }
        return acc;
      },
      {
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        expectedNext14Days: 0,
      },
    );

    const chartData = [...monthlyData.values()];

    return NextResponse.json({ stats, chartData });
  } catch (_error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
