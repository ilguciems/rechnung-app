import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma-client";

type LogActivityParams = {
  userId?: string;
  organizationId?: string;
  companyId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "DOWNLOAD" | "SEND";
  entityType: "INVOICE" | "COMPANY" | "EMAIL";
  entityId?: string;
  metadata?: Record<string, Prisma.InputJsonValue>;
};

export async function logActivity({
  userId,
  organizationId,
  companyId,
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      userId,
      organizationId,
      companyId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}
