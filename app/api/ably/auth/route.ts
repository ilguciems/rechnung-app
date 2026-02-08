import Ably, { type TokenParams } from "ably";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership)
    return NextResponse.json(
      { error: "No organization found" },
      { status: 403 },
    );

  const client = new Ably.Rest(process.env.ABLY_API_KEY as string);

  const tokenParams: TokenParams = {
    clientId: session.user.id,
    capability: {
      [`org-${membership.organizationId}`]: [
        "subscribe",
        "publish",
        "presence",
      ],
    },
  };

  const tokenRequest = await client.auth.createTokenRequest(tokenParams);
  return NextResponse.json(tokenRequest);
}
