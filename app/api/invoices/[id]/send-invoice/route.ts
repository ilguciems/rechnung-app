import Ably from "ably";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { getAuthData } from "@/lib/get-auth-data";
import { generateInvoicePDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma-client";
import { sendOrganizationEmail } from "@/utils/organization-email";
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { to, subject, message } = await req.json();

    const session = await getAuthData();
    if (!session || !session.org)
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );

    const invoice = await prisma.invoice.findUnique({
      where: { id, companyId: session.org.companyId },
      include: { items: true, companySnapshot: true },
    });

    if (!invoice || !invoice.companySnapshot) {
      return NextResponse.json(
        { error: "Rechnungsdaten fehlen" },
        { status: 400 },
      );
    }

    const pdfBuffer = await generateInvoicePDF(
      invoice,
      invoice.companySnapshot,
    );
    const base64Attachment = Buffer.from(pdfBuffer).toString("base64");

    await sendOrganizationEmail({
      to,
      recipientName: invoice.customerName,
      subject: subject || `Rechnung ${invoice.invoiceNumber}`,
      text: message,
      fileName: `invoice-${invoice.invoiceNumber}.pdf`,
      attachment: base64Attachment,
      html: message.replace(/\n/g, "<br>"),
    });

    await prisma.invoice.update({
      where: { id },
      data: {
        lastSentAt: new Date(),
        invoiceSentAt: new Date(),
      },
    });

    try {
      const ably = new Ably.Rest(process.env.ABLY_API_KEY as string);
      const channel = ably.channels.get(`org-${session.org.id}`);

      channel
        .publish({
          name: "invoice_email_sent",
          data: {
            id: invoice.id,
            number: invoice.invoiceNumber,
            userName: session.user.name,
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
      action: "SEND",
      entityType: "EMAIL",
      entityId: invoice.id,
      metadata: {
        type: "invoice",
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
