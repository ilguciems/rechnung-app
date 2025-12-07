import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'customers' | 'products'
    const q = searchParams.get("search")?.trim().toLowerCase() ?? "";

    if (!type) {
      return NextResponse.json(
        { error: "Missing search type" },
        { status: 400 },
      );
    }

    if (type === "customers") {
      const customers = await prisma.invoice.findMany({
        where: q ? { customerName: { contains: q, mode: "insensitive" } } : {},
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
        where: q ? { description: { contains: q, mode: "insensitive" } } : {},
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

    return NextResponse.json({ error: "Invalid search type" }, { status: 400 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
