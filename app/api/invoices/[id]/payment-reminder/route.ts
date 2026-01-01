import { NextResponse } from "next/server";
import { generateMahnungPDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const { searchParams } = new URL(req.url);
  const fee = parseFloat(searchParams.get("fee") || "2.50");
  const days = parseInt(searchParams.get("days") || "7", 10);
  const level = parseInt(searchParams.get("level") || "1", 10);

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, companySnapshot: true },
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

  const pdfBuffer = await generateMahnungPDF(invoice, invoice.companySnapshot, {
    mahngebuehr: fee,
    deadlineDays: days,
    level: level as 1 | 2 | 3,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=mahnung-${level}-${invoice.invoiceNumber}.pdf`,
    },
  });
}
