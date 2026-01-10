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

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      companySnapshot: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!invoice.companySnapshot) {
    return NextResponse.json(
      { error: "Company snapshot is missing for this invoice" },
      { status: 500 },
    );
  }

  const pdfBuffer = await generateInvoicePDF(invoice, invoice.companySnapshot);

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
