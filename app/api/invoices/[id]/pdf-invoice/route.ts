import Ably from "ably";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { getAuthData } from "@/lib/get-auth-data";
import { generateInvoicePDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const session = await getAuthData();

  if (!session || !session.org) {
    return NextResponse.json({ error: "Nicht authorisiert" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id, companyId: session.org.companyId },
    include: {
      items: true,
      companySnapshot: true,
    },
  });

  if (!invoice) {
    return NextResponse.json(
      { error: "Keine Rechnung gefunden" },
      { status: 404 },
    );
  }

  if (!invoice.companySnapshot) {
    return NextResponse.json(
      { error: "Company snapshot für diese Rechnung nicht gefunden" },
      { status: 500 },
    );
  }

  let finalInvoice = invoice;

  if (invoice.deliveryMethod === "POST" && !invoice.invoiceSentAt) {
    finalInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        lastSentAt: new Date(),
        invoiceSentAt: new Date(),
      },
      include: { items: true, companySnapshot: true },
    });
  }

  if (!finalInvoice.companySnapshot) {
    return NextResponse.json(
      { error: "Company snapshot fehlt" },
      { status: 500 },
    );
  }

  const pdfBuffer = await generateInvoicePDF(
    finalInvoice,
    finalInvoice.companySnapshot,
  );

  try {
    const ably = new Ably.Rest(process.env.ABLY_API_KEY as string);
    const channel = ably.channels.get(`org-${session.org.id}`);

    channel
      .publish({
        name: "invoice_downloaded",
        data: {
          id: finalInvoice.id,
          number: finalInvoice.invoiceNumber,
          userName: session.user.name,
          isSend:
            finalInvoice.deliveryMethod === "POST" && !invoice.invoiceSentAt,
        },
        clientId: session.user.id,
      })
      .catch((err) => console.error("Ably publish error:", err));
  } catch (e) {
    console.error("Ably setup error:", e);
  }

  await logActivity({
    userId: session.user.id,
    organizationId: session.org?.id,
    companyId: invoice.companyId,
    action: "DOWNLOAD",
    entityType: "INVOICE",
    entityId: invoice.id,
    metadata: {
      type: "invoice",
      invoiceNumber: invoice.invoiceNumber,
      format: "pdf",
    },
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice.id}.pdf`,
    },
  });
}
