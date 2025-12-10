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
    where: { id: Number(id) },
    include: { items: true },
  });

  const company = await prisma.company.findFirst();

  if (!company) {
    return NextResponse.json(
      { error: "No company data found" },
      { status: 400 },
    );
  }

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdfBuffer = await generateMahnungPDF(invoice, company, {
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
