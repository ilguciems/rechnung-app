import { NextResponse } from "next/server";
import { generateInvoicePDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
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

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice.id}.pdf`,
    },
  });
}
