// app/api/invoices/last/route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { organization: { include: { company: true } } },
    });

    if (!membership?.organization.company) {
      return NextResponse.json(null);
    }

    const company = membership.organization.company;

    const lastInvoice = await prisma.invoice.findFirst({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    if (!lastInvoice) {
      return NextResponse.json(
        { error: "Keine Rechnungen vorhanden" },
        { status: 404 },
      );
    }

    await prisma.item.deleteMany({
      where: { invoiceId: lastInvoice.id },
    });

    await prisma.invoice.delete({
      where: { id: lastInvoice.id },
    });

    await logActivity({
      userId: session.user.id,
      organizationId: membership.organizationId,
      companyId: company.id,
      action: "DELETE",
      entityType: "INVOICE",
      entityId: lastInvoice.id,
      metadata: {
        type: "invoice",
        invoiceNumber: lastInvoice.invoiceNumber,
      },
    });

    return NextResponse.json({ success: true, deletedId: lastInvoice.id });
  } catch (e) {
    console.error("DELETE last invoice error:", e);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
