import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma-client";
import { validateQuery } from "@/lib/validateQuery";
import { invoiceSchema as createInvoiceSchema } from "@/lib/zod-schema";

const querySchema = z.object({
  search: z.string().optional().default(""),
  isPaid: z.enum(["true", "false"]).optional(),
});

export async function GET(req: Request) {
  return validateQuery(req, querySchema, async ({ search, isPaid }) => {
    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { customerName: { contains: search, mode: "insensitive" } },
                  { invoiceNumber: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          isPaid ? { isPaid: isPaid === "true" } : {},
        ],
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  });
}

export async function POST(req: Request) {
  try {
    // validate request
    const data = createInvoiceSchema.parse(await req.json());

    // check if company exists
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { error: "No company data found. Please create company first." },
        { status: 400 },
      );
    }

    // make invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${count + 1}`;

    // make invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        ...data,
        companyId: company.id,
        isPaid: false,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    // zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    console.error("❌ Unexpected error in POST /invoices:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
