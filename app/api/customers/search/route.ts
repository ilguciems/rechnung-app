import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Fehlender Suchtyp" }, { status: 400 });
    }

    if (type === "customers") {
      const customers = await prisma.invoice.findMany({
        where: q
          ? {
              companyId: company.id,
              customerName: { contains: q, mode: "insensitive" },
            }
          : { companyId: company.id },
        select: {
          id: true,
          customerName: true,
          customerStreet: true,
          customerHouseNumber: true,
          customerZipCode: true,
          customerCity: true,
          customerCountry: true,
          customerEmail: true,
          customerPhone: true,
        },
        distinct: [
          "customerName",
          "customerStreet",
          "customerHouseNumber",
          "customerZipCode",
          "customerCity",
          "customerCountry",
          "customerEmail",
          "customerPhone",
        ],
        take: 10,
      });

      return NextResponse.json(customers);
    }

    if (type === "products") {
      const products = await prisma.item.findMany({
        where: {
          invoice: {
            companyId: company.id,
          },
          ...(q
            ? {
                description: {
                  contains: q,
                  mode: "insensitive",
                },
              }
            : {}),
        },
        select: {
          id: true,
          description: true,
          unitPrice: true,
          taxRate: true,
        },
        distinct: ["description"],
        take: 10,
      });

      return NextResponse.json(products);
    }

    return NextResponse.json({ error: "Ungültiger Suchtyp" }, { status: 400 });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
