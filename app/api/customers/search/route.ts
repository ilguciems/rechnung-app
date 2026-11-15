import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET(req: Request) {
  const t = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { organization: { include: { company: true } } },
    });

    if (!membership?.organization.company) {
      return NextResponse.json(null);
    }

    const company = membership.organization.company;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'customers' | 'products'
    const q = searchParams.get("search")?.trim().toLowerCase() ?? "";

    if (!type) {
      return NextResponse.json(
        { error: t("missingSearchType") },
        { status: 400 },
      );
    }

    if (type === "customers") {
      const customers = await prisma.customer.findMany({
        where: {
          companyId: company.id,
          ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        },
        select: {
          id: true,
          customerNumber: true,
          name: true,
          street: true,
          houseNumber: true,
          zipCode: true,
          city: true,
          country: true,
          email: true,
          phone: true,
        },
        orderBy: { name: "asc" },
        take: 10,
      });

      return NextResponse.json(
        customers.map((customer) => ({
          id: customer.id,
          customerNumber: customer.customerNumber,
          customerName: customer.name,
          customerStreet: customer.street,
          customerHouseNumber: customer.houseNumber,
          customerZipCode: customer.zipCode,
          customerCity: customer.city,
          customerCountry: customer.country,
          customerEmail: customer.email,
          customerPhone: customer.phone,
        })),
      );
    }

    if (type === "products") {
      // LIKE wildcards must stay literal, like they were with `contains`.
      const pattern = `%${q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

      const products = await prisma.$queryRaw<
        {
          id: string;
          description: string;
          unitPrice: number;
          taxRate: number | null;
        }[]
      >`
        SELECT DISTINCT ON (it.description)
          it.id,
          it.description,
          it."unitPrice",
          it."taxRate"
        FROM "item" it
        JOIN "invoice" i ON i.id = it."invoiceId"
        WHERE i."companyId" = ${company.id}
          AND it.description ILIKE ${pattern}
        ORDER BY it.description
        LIMIT 10
      `;

      return NextResponse.json(products);
    }

    return NextResponse.json(
      { error: t("invalidSearchType") },
      { status: 400 },
    );
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }

    return NextResponse.json({ error: t("serverError") }, { status: 500 });
  }
}
