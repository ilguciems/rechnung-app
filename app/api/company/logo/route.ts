import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  const company = await prisma.company.findFirst({
    select: { logoUrl: true },
  });

  return NextResponse.json({
    logoUrl: company?.logoUrl ?? null,
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const company = await prisma.company.findFirst();

    let fileName: string;

    if (!company) {
      fileName = "logo.png";
    } else {
      fileName = `logo_${Date.now()}.png`;
    }

    const filePath = path.join(process.cwd(), "public", "assets", fileName);
    await fs.writeFile(filePath, buffer);

    if (company) {
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
    return NextResponse.json({ status: "success", fileName });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}
