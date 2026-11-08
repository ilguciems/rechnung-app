import fs from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/activity-log";
import { auth } from "@/lib/auth";
import diffObjects from "@/lib/diff-objects";
import { deleteSupersededLogo } from "@/lib/logo-cleanup";
import { getUserLogoUrl } from "@/lib/logo-url";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  const t = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
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

    // A user without an organization still uploads a logo before creating one,
    // so the file lookup has to run on this path as well.
    if (!organization) {
      return NextResponse.json({ logoUrl: await getUserLogoUrl(userId) });
    }

    const company = organization?.company;

    return NextResponse.json({
      logoUrl: company?.logoUrl ?? (await getUserLogoUrl(userId)),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }

    return NextResponse.json({ error: t("serverError") }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const t = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
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
      return NextResponse.json({ error: t("noPermission") }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: t("noFileSelected") }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // A fresh filename per upload keeps the URL unique, so the immutable cache
    // header on the assets route never serves a stale image.
    const fileName = `logo_${company?.id ?? userId}_${Date.now()}.png`;
    const logoUrl = `/api/assets/${fileName}`;

    // A company stores the URL it points at; without one the previous upload is
    // resolved from disk, so both paths can drop the file they replace.
    const oldLogoUrl = company ? company.logoUrl : await getUserLogoUrl(userId);

    const filePath = path.join(process.cwd(), "public", "assets", fileName);
    await fs.writeFile(filePath, buffer);

    if (company) {
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

    await deleteSupersededLogo(prisma, oldLogoUrl, logoUrl);

    const changes = diffObjects(
      { logoUrl: oldLogoUrl } as Record<string, Prisma.InputJsonValue>,
      { logoUrl } as Record<string, Prisma.InputJsonValue>,
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
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }

    return NextResponse.json({ error: t("serverError") }, { status: 500 });
  }
}
