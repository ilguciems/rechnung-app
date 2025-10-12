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
    include: { items: true },
  });

  const company = await prisma.company.findFirst();
  if (!company) {
    return NextResponse.json(
      { error: "No company data found. Please create company first." },
      { status: 400 },
    );
  }

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdfBuffer = await generateInvoicePDF(invoice, company);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice.id}.pdf`,
    },
  });
}
