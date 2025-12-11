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

  // Create snapshot
  const snapshotData = (({
    name,
    street,
    houseNumber,
    zipCode,
    city,
    country,
    phone,
    email,
    iban,
    bic,
    bank,
    logoUrl,
    isSubjectToVAT,
    firstTaxRate,
    secondTaxRate,
    legalForm,
    steuernummer,
    ustId,
    handelsregisternummer,
  }) => ({
    name,
    street,
    houseNumber,
    zipCode,
    city,
    country,
    phone,
    email,
    iban,
    bic,
    bank,
    logoUrl,
    isSubjectToVAT,
    firstTaxRate,
    secondTaxRate,
    legalForm,
    steuernummer,
    ustId,
    handelsregisternummer,
  }))(company);

  await prisma.companySnapshot.create({
    data: {
      companyId: company.id,
      ...snapshotData,
    },
  });

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

  // snapshot
  const snapshotFields = (({
    name,
    street,
    houseNumber,
    zipCode,
    city,
    country,
    phone,
    email,
    iban,
    bic,
    bank,
    logoUrl,
    isSubjectToVAT,
    firstTaxRate,
    secondTaxRate,
    legalForm,
    steuernummer,
    ustId,
    handelsregisternummer,
  }) => ({
    name,
    street,
    houseNumber,
    zipCode,
    city,
    country,
    phone,
    email,
    iban,
    bic,
    bank,
    logoUrl,
    isSubjectToVAT,
    firstTaxRate,
    secondTaxRate,
    legalForm,
    steuernummer,
    ustId,
    handelsregisternummer,
  }))(updated);

  await prisma.companySnapshot.create({
    data: {
      companyId: updated.id,
      ...snapshotFields,
    },
  });

  return NextResponse.json(updated);
}
