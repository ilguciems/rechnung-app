// app/api/invoices/last/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function DELETE() {
  try {
    const lastInvoice = await prisma.invoice.findFirst({
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

    return NextResponse.json({ success: true, deletedId: lastInvoice.id });
  } catch (e) {
    console.error("DELETE last invoice error:", e);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
