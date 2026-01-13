import fs from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/activity-log";
import { auth } from "@/lib/auth";
import diffObjects from "@/lib/diff-objects";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
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
        company: {
          select: {
            logoUrl: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(null);
    }

    const company = organization?.company;

    return NextResponse.json({
      logoUrl: company?.logoUrl ?? null,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
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

    const userId = session.user.id;

    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
      },
      include: {
        organization: {
          include: {
            company: true,
          },
        },
      },
    });

    const organization = membership?.organization ?? null;
    const company = organization?.company ?? null;

    if (company && membership?.role !== "admin") {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Kein File gewählt" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    let fileName: string;

    if (!company) {
      fileName = `logo_${userId}.png`;
    } else {
      fileName = `logo_${company.id}_${Date.now()}.png`;
    }

    const filePath = path.join(process.cwd(), "public", "assets", fileName);
    await fs.writeFile(filePath, buffer);

    let oldLogoUrl: string | null = null;

    if (company) {
      oldLogoUrl = company.logoUrl;
      const logoUrl = `/assets/${fileName}`;

      const updated = await prisma.company.update({
        where: { id: company.id },
        data: { logoUrl },
      });

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
    }

    const changes = diffObjects(
      { logoUrl: oldLogoUrl } as Record<string, Prisma.InputJsonValue>,
      { logoUrl: `/assets/${fileName}` } as Record<
        string,
        Prisma.InputJsonValue
      >,
    );

    if (company && organization) {
      await logActivity({
        userId,
        organizationId: organization.id,
        companyId: company.id,
        action: "UPDATE",
        entityType: "COMPANY",
        entityId: company.id,
        metadata: {
          type: "company-logo",
          changes,
        },
      });
    }
    return NextResponse.json({ status: "success", fileName });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 400 });
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
