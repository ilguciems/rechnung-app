import { headers } from "next/headers";
import Mailjet from "node-mailjet";
import { auth } from "@/lib/auth";
import { decrypt } from "@/lib/crypto-utils";
import { prisma } from "@/lib/prisma-client";

type SendEmailProps = {
  to: string;
  subject: string;
  text: string;
  attachment: string;
  fileName: string;
  recipientName: string;
  html?: string;
};

export async function sendOrganizationEmail({
  to,
  subject,
  text,
  attachment,
  fileName,
  recipientName,
  html,
}: SendEmailProps) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Nicht authorisiert");
    }

    const organization = await prisma.organization.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        mailjet: {
          select: {
            publicKeyEnc: true,
            privateKeyEnc: true,
            fromEmail: true,
            fromName: true,
            isEnabled: true,
          },
        },
      },
    });

    if (!organization) {
      throw new Error("Nicht authorisiert");
    }

    if (!organization.mailjet) {
      throw new Error("Keine Mailversand-Einstellungen gefunden");
    }

    if (!organization.mailjet.isEnabled) {
      throw new Error("Mailversand ist deaktiviert");
    }

    const mailjet = Mailjet.apiConnect(
      decrypt(organization.mailjet.publicKeyEnc) as string,
      decrypt(organization.mailjet.privateKeyEnc) as string,
    );

    const emailFrom = organization.mailjet.fromEmail as string;
    const fromName = organization.mailjet.fromName as string;

    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: emailFrom,
            Name: fromName,
          },
          To: [
            {
              Email: to,
              Name: recipientName,
            },
          ],
          Subject: subject,
          TextPart: text,
          HtmlPart: html,
          Attachments: [
            {
              ContentType: "application/pdf",
              Filename: fileName,
              Base64Content: attachment,
            },
          ],
        },
      ],
    });
    return response.body;
  } catch (error) {
    console.error("Error sending email with Mailjet:", error);
    throw new Error("Failed to send email.");
  }
}
