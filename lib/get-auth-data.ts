"use server";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export const getAuthData = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: {
      role: true,
      organizationId: true,
      organization: {
        select: { name: true, company: { select: { id: true } } },
      },
    },
  });

  return {
    user: session.user,
    session: session.session,
    org: membership
      ? {
          role: membership.role,
          id: membership.organizationId,
          name: membership.organization.name,
          companyId: membership.organization.company?.id,
        }
      : null,
  };
});
