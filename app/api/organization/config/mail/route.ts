import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { decrypt, encrypt } from "@/lib/crypto-utils";
import { prisma } from "@/lib/prisma-client";
import {
  type OrganizationConfigMailType,
  organizationConfigMailSchema,
} from "@/lib/zod-schema";
import { validateMailjetKeys } from "@/utils/validate-mailjet-keys";

export async function GET() {
  const t = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
      select: {
        mailjet: {
          select: {
            publicKeyEnc: true,
            privateKeyEnc: true,
            isEnabled: true,
            fromEmail: true,
            fromName: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }

    if (!organization.mailjet) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      isEnabled: organization?.mailjet?.isEnabled,
      fromEmail: organization?.mailjet?.fromEmail,
      fromName: organization?.mailjet?.fromName,
      isPublicKeySet: Boolean(organization?.mailjet?.publicKeyEnc),
      isPrivateKeySet: Boolean(organization?.mailjet?.privateKeyEnc),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t("databaseError") }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: t("internalServerError"),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function POST(req: Request) {
  const t2 = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t2("unauthorized") }, { status: 401 });
    }

    const {
      publicKeyEnc,
      privateKeyEnc,
      fromEmail,
      fromName,
      isEnabled,
    }: OrganizationConfigMailType = organizationConfigMailSchema.parse(
      await req.json(),
    );

    // Validate Mailjet keys before saving
    const validation = await validateMailjetKeys(
      publicKeyEnc,
      privateKeyEnc,
      fromEmail,
    );
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || t2("invalidApiKeys") },
        { status: 400 },
      );
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: t2("unauthorized") }, { status: 401 });
    }

    const mailjet = await prisma.mailjetConfig.create({
      data: {
        organizationId: organization.id,
        publicKeyEnc: encrypt(publicKeyEnc),
        privateKeyEnc: encrypt(privateKeyEnc),
        fromEmail,
        fromName,
        isEnabled,
      },
    });

    const response = {
      isEnabled: mailjet.isEnabled,
      fromEmail: mailjet.fromEmail,
      fromName: mailjet.fromName,
      isPublicKeySet: true,
      isPrivateKeySet: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t2("databaseError") }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: t2("internalServerError"),
        details: JSON.stringify(error, null, 2),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function PATCH(req: Request) {
  const t3 = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t3("unauthorized") }, { status: 401 });
    }

    const data: Partial<OrganizationConfigMailType> =
      organizationConfigMailSchema.partial().parse(await req.json());

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
      select: {
        id: true,
        mailjet: {
          select: {
            publicKeyEnc: true,
            privateKeyEnc: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: t3("unauthorized") }, { status: 401 });
    }

    // Validate new keys if provided
    if (data.publicKeyEnc || data.privateKeyEnc) {
      const publicKey = data.publicKeyEnc || "";
      const privateKey = data.privateKeyEnc || "";

      // If only one key is provided, we can't validate
      if (!publicKey || !privateKey) {
        return NextResponse.json(
          {
            error: t3("bothKeysRequired"),
          },
          { status: 400 },
        );
      }

      // Get fromEmail - use new value if provided, otherwise fetch from DB
      let fromEmailToValidate = data.fromEmail;
      if (!fromEmailToValidate && organization.mailjet) {
        const existingConfig = await prisma.mailjetConfig.findUnique({
          where: { organizationId: organization.id },
          select: { fromEmail: true },
        });
        fromEmailToValidate = existingConfig?.fromEmail || undefined;
      }

      const validation = await validateMailjetKeys(
        publicKey,
        privateKey,
        fromEmailToValidate,
      );
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || t3("invalidApiKeys") },
          { status: 400 },
        );
      }
    }

    // Validate fromEmail if it's being updated (without keys)
    if (data.fromEmail && !data.publicKeyEnc && !data.privateKeyEnc) {
      const existingConfig = await prisma.mailjetConfig.findUnique({
        where: { organizationId: organization.id },
        select: { publicKeyEnc: true, privateKeyEnc: true },
      });

      if (existingConfig?.publicKeyEnc && existingConfig?.privateKeyEnc) {
        const validation = await validateMailjetKeys(
          decrypt(existingConfig.publicKeyEnc) as string,
          decrypt(existingConfig.privateKeyEnc) as string,
          data.fromEmail,
        );
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || t3("invalidSenderEmail") },
            { status: 400 },
          );
        }
      }
    }

    const mailjet = await prisma.mailjetConfig.update({
      where: {
        organizationId: organization.id,
      },
      data: {
        ...data,
        ...(data.publicKeyEnc && { publicKeyEnc: encrypt(data.publicKeyEnc) }),
        ...(data.privateKeyEnc && {
          privateKeyEnc: encrypt(data.privateKeyEnc),
        }),
      },
    });

    const response = {
      isEnabled: mailjet.isEnabled,
      fromEmail: mailjet.fromEmail,
      fromName: mailjet.fromName,
      isPublicKeySet: true,
      isPrivateKeySet: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t3("databaseError") }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: t3("internalServerError"),
        details: JSON.stringify(error, null, 2),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function DELETE() {
  const t4 = await getTranslations("apiErrors");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: t4("unauthorized") }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: t4("unauthorized") }, { status: 401 });
    }

    await prisma.mailjetConfig.delete({
      where: {
        organizationId: organization.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: t4("databaseError") }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: t4("internalServerError"),
        details: JSON.stringify(error, null, 2),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
