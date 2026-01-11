import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/activity-log";
import { getAuthData } from "@/lib/get-auth-data";
import { prisma } from "@/lib/prisma-client";

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const { isPaid } = await req.json();
    const session = await getAuthData();

    if (!session || !session.org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oldPaidAt = await prisma.invoice.findUnique({
      where: { id },
      select: { paidAt: true },
    });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        isPaid,
        paidAt: isPaid ? new Date() : null,
      },
      include: { items: true },
    });

    const changes = {
      isPaid: {
        old: isPaid ? "open" : "paid",
        new: isPaid ? "paid" : "open",
      },
      paidAt: {
        old: (oldPaidAt?.paidAt as Date | null)?.toLocaleString() ?? null,
        new: invoice.paidAt?.toLocaleString() ?? null,
      },
    };

    await logActivity({
      userId: session.user.id,
      organizationId: session.org?.id,
      companyId: invoice.companyId,
      action: "UPDATE",
      entityType: "INVOICE",
      entityId: invoice.id,
      metadata: {
        type: "invoice",
        invoiceNumber: invoice.invoiceNumber,
        changes,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
