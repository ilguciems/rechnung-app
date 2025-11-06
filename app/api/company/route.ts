import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

// Get a company
export async function GET() {
  const company = await prisma.company.findFirst();
  return NextResponse.json(company);
}

// Create a new company
export async function POST(req: Request) {
  const data = await req.json();
  const existing = await prisma.company.findFirst();
  if (existing) {
    return NextResponse.json(
      { error: "Firma existiert bereits" },
      { status: 400 },
    );
  }
  const company = await prisma.company.create({ data });
  return NextResponse.json(company);
}

// Update a company
export async function PATCH(req: Request) {
  const data = await req.json();
  const company = await prisma.company.findFirst();

  if (!company) {
    return NextResponse.json(
      { error: "Keine Firma gefunden" },
      { status: 404 },
    );
  }

  const updated = await prisma.company.update({
    where: { id: company.id },
    data,
  });

  return NextResponse.json(updated);
}
