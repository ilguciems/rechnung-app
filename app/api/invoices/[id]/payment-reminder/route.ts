import Ably from "ably";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { getAuthData } from "@/lib/get-auth-data";
import { generateMahnungPDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getAuthData();

  if (!session || !session.org) {
    return NextResponse.json({ error: "Nicht authorisiert" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fee = parseFloat(searchParams.get("fee") || "2.50");
  const days = parseInt(searchParams.get("days") || "7", 10);
  const level = parseInt(searchParams.get("level") || "1", 10);

  const invoice = await prisma.invoice.findUnique({
    where: { id, companyId: session.org.companyId },
    include: { items: true, companySnapshot: true },
  });

  if (!invoice) {
    return NextResponse.json(
      { error: "Keine Rechnung gefunden" },
      { status: 404 },
    );
  }

  if (!invoice.companySnapshot) {
    return NextResponse.json(
      { error: "Company snapshot für diese Rechnung fehlt" },
      { status: 500 },
    );
  }

  let finalInvoice = invoice;

  if (invoice.deliveryMethod === "POST") {
    const dateField =
      level === 1
        ? "firstReminderSentAt"
        : level === 2
          ? "secondReminderSentAt"
          : "thirdReminderSentAt";

    if (!invoice[dateField as keyof typeof invoice]) {
      const now = new Date();
      finalInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          [dateField]: now,
          lastReminderLevel: level,
          lastSentAt: now,
        },
        include: { items: true, companySnapshot: true },
      });
    }
  }

  if (!finalInvoice.companySnapshot) {
    return NextResponse.json(
      { error: "Company snapshot für diese Rechnung fehlt" },
      { status: 404 },
    );
  }

  const pdfBuffer = await generateMahnungPDF(
    finalInvoice,
    finalInvoice.companySnapshot,
    {
      mahngebuehr: fee,
      deadlineDays: days,
      level: level as 1 | 2 | 3,
    },
  );

  try {
    const ably = new Ably.Rest(process.env.ABLY_API_KEY as string);
    const channel = ably.channels.get(`org-${session.org.id}`);

    channel
      .publish({
        name: "invoice_reminder_downloaded",
        data: {
          id: invoice.id,
          number: invoice.invoiceNumber,
          userName: session.user.name,
          isSend: invoice.deliveryMethod === "POST",
          level,
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
      type: "payment-reminder",
      invoiceNumber: invoice.invoiceNumber,
      format: "pdf",
      level,
    },
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=mahnung-${level}-${invoice.invoiceNumber}.pdf`,
    },
  });
}
