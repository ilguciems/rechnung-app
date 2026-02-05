import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/activity-log";
import { auth } from "@/lib/auth";
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

function calculateOverduePaymentLevel(invoice: {
  isPaid: boolean;
  invoiceSentAt: Date | string | null;
  lastReminderLevel: number | null;
  firstReminderSentAt: Date | string | null;
  secondReminderSentAt: Date | string | null;
  thirdReminderSentAt: Date | string | null;
}): number | null {
  if (invoice.isPaid) return null;

  const now = Date.now();
  const lastIssuedDate =
    invoice.thirdReminderSentAt ||
    invoice.secondReminderSentAt ||
    invoice.firstReminderSentAt ||
    invoice.invoiceSentAt;

  if (!lastIssuedDate) return null;

  const diffDays =
    (now - new Date(lastIssuedDate).getTime()) / (1000 * 60 * 60 * 24);
  const currentLevel = invoice.lastReminderLevel || 0;

  if (currentLevel >= 3) return 3;

  const daysToWait = currentLevel === 0 ? 30 : 14;

  if (diffDays >= daysToWait) {
    return currentLevel + 1;
  }

  return currentLevel > 0 ? currentLevel : null;
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Nicht authorisiert" }, { status: 401 });
  }
  const userId = session.user.id;
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: {
      organization: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!membership?.organization.company) {
    return NextResponse.json(
      { error: "Kein Unternehmen zugeordnet" },
      { status: 400 },
    );
  }

  const companyId = membership.organization.company.id;

  return validateQuery(
    req,
    querySchema,
    async ({ search, isPaid, page, pageSize }: QueryType) => {
      const where: Prisma.InvoiceWhereInput = {
        companyId,
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
      const invoicesWithOverduePaymentLevel = invoices.map((invoice) => ({
        ...invoice,
        overduePaymentLevel: calculateOverduePaymentLevel(invoice),
      }));

      return NextResponse.json({
        data: invoicesWithOverduePaymentLevel,
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Nicht authorisiert" },
        { status: 401 },
      );
    }
    // 1. Validate input
    const data = createInvoiceSchema.parse(await req.json());
    const userId = session.user.id;
    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        mailjet: {
          select: { isEnabled: true },
        },
        company: {
          select: {
            id: true,
            name: true,
            street: true,
            houseNumber: true,
            zipCode: true,
            city: true,
            country: true,
            phone: true,
            email: true,
            iban: true,
            bic: true,
            bank: true,
            logoUrl: true,
            isSubjectToVAT: true,
            firstTaxRate: true,
            secondTaxRate: true,
            legalForm: true,
            steuernummer: true,
            ustId: true,
            handelsregisternummer: true,
          },
        },
      },
    });

    if (!organization?.company) {
      return NextResponse.json(
        { error: "Organisation hat kein Unternehmen" },
        { status: 400 },
      );
    }

    // 2. Check company exists

    const companyData = organization?.company;
    const companyId = companyData?.id;

    if (!companyData) {
      return NextResponse.json(
        { error: "Keine Unternehmensdaten gefunden" },
        { status: 400 },
      );
    }

    // 2. Find latest snapshot
    let snapshot = await prisma.companySnapshot.findFirst({
      where: { companyId: companyData.id },
      orderBy: { createdAt: "desc" },
    });

    // 3. Create snapshot if missing
    if (!snapshot) {
      snapshot = await prisma.companySnapshot.create({
        data: {
          ...companyData,
          companyId: companyData.id,
        },
      });
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
      email: data.customerEmail ? normalize(data.customerEmail) : "",
      phone: data.customerPhone ? normalize(data.customerPhone) : "",
    };

    // Load all unique customers (one record per customerNumber)
    const existingCustomers = await prisma.invoice.findMany({
      where: { companyId },
      select: {
        customerName: true,
        customerStreet: true,
        customerHouseNumber: true,
        customerZipCode: true,
        customerCity: true,
        customerCountry: true,
        customerNumber: true,
        customerEmail: true,
        customerPhone: true,
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
        normalize(c.customerCountry) === normalizedInput.country &&
        normalize(c.customerEmail ?? "") === normalizedInput.email &&
        normalize(c.customerPhone ?? "") === normalizedInput.phone
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
    const deliveryMethod = organization?.mailjet?.isEnabled ? "EMAIL" : "POST";

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        companyId,
        companySnapshotId: snapshot.id,
        isPaid: false,

        createdByUserId: session.user.id,

        deliveryMethod: deliveryMethod,

        // Insert customer fields + computed customerNumber
        customerNumber,
        customerName: data.customerName.trim(),
        customerStreet: data.customerStreet.trim(),
        customerHouseNumber: data.customerHouseNumber.trim(),
        customerZipCode: data.customerZipCode.trim(),
        customerCity: data.customerCity.trim(),
        customerCountry: data.customerCountry.trim(),
        customerEmail: data.customerEmail ? data.customerEmail.trim() : null,
        customerPhone: data.customerPhone ? data.customerPhone.trim() : null,

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

    await logActivity({
      userId: session.user.id,
      organizationId: organization.id,
      companyId,
      action: "CREATE",
      entityType: "INVOICE",
      entityId: invoice.id,
      metadata: {
        type: "invoice",
        invoiceNumber: invoice.invoiceNumber,
      },
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

    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
