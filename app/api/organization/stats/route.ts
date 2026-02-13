import {
  differenceInDays,
  format,
  isBefore,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { NextResponse } from "next/server";
import { getAuthData } from "@/lib/get-auth-data";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await getAuthData();
    if (!session?.org?.companyId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = session.org.companyId;
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    const invoices = await prisma.invoice.findMany({
      where: { companyId, createdAt: { gte: sixMonthsAgo } },
      include: { items: { select: { unitPrice: true, quantity: true } } },
    });

    const monthlyData: Record<
      string,
      { month: string; revenue: number; pending: number }
    > = {};
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      const monthName = format(date, "MMM", { locale: de });
      monthlyData[monthName] = { month: monthName, revenue: 0, pending: 0 };
    }
    const now = new Date();
    const stats = invoices.reduce(
      (acc, inv) => {
        const total = inv.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        const monthName = format(inv.createdAt, "MMM", { locale: de });

        if (inv.isPaid) {
          acc.totalRevenue += total;
          if (monthlyData[monthName]) monthlyData[monthName].revenue += total;
        } else {
          acc.pendingAmount += total;
          if (monthlyData[monthName]) monthlyData[monthName].pending += total;

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

    const chartData = Object.values(monthlyData).reverse();

    return NextResponse.json({ stats, chartData });
  } catch (_error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
