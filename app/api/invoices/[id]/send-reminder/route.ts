import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { getAuthData } from "@/lib/get-auth-data";
import { generateInvoicePDF, generateMahnungPDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma-client";
import { sendOrganizationEmail } from "@/utils/organization-email";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { to, subject, message, fee } = await req.json();

    const { searchParams } = new URL(req.url);
    const levelParam = searchParams.get("level");
    const level = levelParam ? parseInt(levelParam, 10) : 1;

    const session = await getAuthData();
    if (!session)
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, companySnapshot: true },
    });

    if (!invoice || !invoice.companySnapshot) {
      return NextResponse.json(
        { error: "Rechnungsdaten fehlen" },
        { status: 400 },
      );
    }

    const pdfBuffer = await generateMahnungPDF(
      invoice,
      invoice.companySnapshot,
      {
        mahngebuehr: parseFloat(fee || "0"),
        deadlineDays: 7,
        level: level as 1 | 2 | 3,
      },
    );

    const attachments = [
      {
        fileName: `${level === 1 ? "Zahlungserinnerung" : `${level - 1}.mahnung`}-${invoice.invoiceNumber}.pdf`,
        base64: Buffer.from(pdfBuffer).toString("base64"),
      },
    ];

    if (level === 1) {
      const originalPdfBuffer = await generateInvoicePDF(
        invoice,
        invoice.companySnapshot,
      );
      attachments.push({
        fileName: `Kopie_Rechnung_${invoice.invoiceNumber}.pdf`,
        base64: Buffer.from(originalPdfBuffer).toString("base64"),
      });
    }

    await sendOrganizationEmail({
      to,
      recipientName: invoice.customerName,
      subject: subject,
      text: message,
      attachments: attachments,
      html: message.replace(/\n/g, "<br>"),
    });

    await prisma.invoice.update({
      where: { id },
      data: {
        lastSentAt: new Date(),
        lastReminderLevel: level,
        ...(level === 1 &&
          !invoice.firstReminderSentAt && { firstReminderSentAt: new Date() }),
        ...(level === 2 &&
          !invoice.secondReminderSentAt && {
            secondReminderSentAt: new Date(),
          }),
        ...(level === 3 &&
          !invoice.thirdReminderSentAt && { thirdReminderSentAt: new Date() }),
      },
    });

    await logActivity({
      userId: session.user.id,
      organizationId: session.org?.id,
      companyId: invoice.companyId,
      action: "SEND",
      entityType: "EMAIL",
      entityId: invoice.id,
      metadata: {
        type: "payment-reminder",
        level,
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
