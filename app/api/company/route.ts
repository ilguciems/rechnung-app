import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

// Get a company
export async function GET() {
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

  return NextResponse.json(membership.organization.company);
}

// Create a new company
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const data = await req.json();

  // check if organization already exists
  const existingOrg = await prisma.organization.findFirst({
    where: { ownerId: userId },
  });

  if (existingOrg) {
    return NextResponse.json(
      { error: "Organization already exists" },
      { status: 400 },
    );
  }

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    // Organization
    const organization = await tx.organization.create({
      data: {
        name: data.name,
        ownerId: userId,
        createdAt: new Date(),
      },
    });

    // Membership
    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: "admin",
      },
    });

    // Company
    const company = await tx.company.create({
      data: {
        ...data,
        logoUrl: `/assets/logo_${userId}.png`,
      },
    });

    // Link org → company
    await tx.organization.update({
      where: { id: organization.id },
      data: { companyId: company.id },
    });

    // Snapshot
    await tx.companySnapshot.create({
      data: {
        companyId: company.id,
        name: company.name,
        street: company.street,
        houseNumber: company.houseNumber,
        zipCode: company.zipCode,
        city: company.city,
        country: company.country,
        phone: company.phone,
        email: company.email,
        iban: company.iban,
        bic: company.bic,
        bank: company.bank,
        logoUrl: company.logoUrl,
        isSubjectToVAT: company.isSubjectToVAT,
        firstTaxRate: company.firstTaxRate,
        secondTaxRate: company.secondTaxRate,
        legalForm: company.legalForm,
        steuernummer: company.steuernummer,
        ustId: company.ustId,
        handelsregisternummer: company.handelsregisternummer,
      },
    });

    return company;
  });

  return NextResponse.json(result);
}

// Update a company
export async function PATCH(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      role: "admin",
    },
    include: {
      organization: true,
    },
  });

  if (!membership?.organization?.companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const updated = await prisma.company.update({
    where: { id: membership.organization.companyId },
    data,
  });

  await prisma.companySnapshot.create({
    data: {
      companyId: updated.id,
      name: updated.name,
      street: updated.street,
      houseNumber: updated.houseNumber,
      zipCode: updated.zipCode,
      city: updated.city,
      country: updated.country,
      phone: updated.phone,
      email: updated.email,
      iban: updated.iban,
      bic: updated.bic,
      bank: updated.bank,
      logoUrl: updated.logoUrl,
      isSubjectToVAT: updated.isSubjectToVAT,
      firstTaxRate: updated.firstTaxRate,
      secondTaxRate: updated.secondTaxRate,
      legalForm: updated.legalForm,
      steuernummer: updated.steuernummer,
      ustId: updated.ustId,
      handelsregisternummer: updated.handelsregisternummer,
    },
  });

  return NextResponse.json(updated);
}
