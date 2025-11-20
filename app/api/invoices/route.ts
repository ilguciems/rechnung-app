import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma-client";
import { validateQuery } from "@/lib/validateQuery";
import { invoiceSchema as createInvoiceSchema } from "@/lib/zod-schema";

const querySchema = z.object({
  search: z.string().optional(),
  isPaid: z.enum(["true", "false"]).optional(),
  page: z.string().transform(Number).default(1),
  pageSize: z.string().transform(Number).default(10),
});

type QueryType = z.infer<typeof querySchema>;

export async function GET(req: Request) {
  return validateQuery(
    req,
    querySchema,
    async ({ search, isPaid, page, pageSize }: QueryType) => {
      const where: Prisma.InvoiceWhereInput = {
        AND: [
          search
            ? {
                OR: [
                  { customerName: { contains: search, mode: "insensitive" } },
                  { invoiceNumber: { contains: search, mode: "insensitive" } },
                  { customerNumber: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          isPaid ? { isPaid: isPaid === "true" } : {},
        ],
      };

      const total = await prisma.invoice.count({ where });

      const invoices = await prisma.invoice.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return NextResponse.json({
        data: invoices,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      });
    },
  );
}

export async function POST(req: Request) {
  try {
    // 1. Validate input
    const data = createInvoiceSchema.parse(await req.json());

    // 2. Check company exists
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { error: "No company data found. Please create company first." },
        { status: 400 },
      );
    }

    // Normalization helper
    const normalize = (v: string) =>
      v.trim().replace(/\s+/g, " ").toLowerCase();

    const normalizedInput = {
      name: normalize(data.customerName),
      street: normalize(data.customerStreet),
      house: normalize(data.customerHouseNumber),
      zip: normalize(data.customerZipCode),
      city: normalize(data.customerCity),
      country: normalize(data.customerCountry),
    };

    // Load all unique customers (one record per customerNumber)
    const existingCustomers = await prisma.invoice.findMany({
      select: {
        customerName: true,
        customerStreet: true,
        customerHouseNumber: true,
        customerZipCode: true,
        customerCity: true,
        customerCountry: true,
        customerNumber: true,
      },
      distinct: ["customerNumber"],
    });

    // Try to find exact match after normalization
    const matched = existingCustomers.find((c) => {
      return (
        normalize(c.customerName) === normalizedInput.name &&
        normalize(c.customerStreet) === normalizedInput.street &&
        normalize(String(c.customerHouseNumber)) === normalizedInput.house &&
        normalize(c.customerZipCode) === normalizedInput.zip &&
        normalize(c.customerCity) === normalizedInput.city &&
        normalize(c.customerCountry) === normalizedInput.country
      );
    });

    let customerNumber: string;

    if (matched) {
      // Use existing KND-xxxx
      customerNumber = matched.customerNumber as string;
    } else {
      // Generate new KND-xxxx
      const lastNumber =
        existingCustomers
          .map((c) => Number(c.customerNumber?.replace(/\D/g, "")))
          .filter((n) => !Number.isNaN(n))
          .sort((a, b) => b - a)[0] ?? 0;

      customerNumber = `KND-${String(lastNumber + 1).padStart(4, "0")}`;
    }

    // 3. Create invoice

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${count + 1}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        companyId: company.id,
        isPaid: false,

        // Insert customer fields + computed customerNumber
        customerNumber,
        customerName: data.customerName.trim(),
        customerStreet: data.customerStreet.trim(),
        customerHouseNumber: data.customerHouseNumber.trim(),
        customerZipCode: data.customerZipCode.trim(),
        customerCity: data.customerCity.trim(),
        customerCountry: data.customerCountry.trim(),

        // Insert items
        items: {
          create: data.items.map((item) => ({
            description: item.description.trim(),
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
