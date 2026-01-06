import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: {
      role: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
  });

  return NextResponse.json({
    role: membership?.role || null,
    id: membership?.organizationId || null,
    name: membership?.organization?.name || null,
  });
}
