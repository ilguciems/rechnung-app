"use server";

import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { GlobalRole } from "@/types/global-roles";

export async function createAdminAction(values: {
  email: string;
  name: string;
}) {
  const { email, name } = values;

  const tempPassword = randomBytes(20).toString("hex") + "A1!";

  await auth.api.createUser({
    body: {
      email,
      password: tempPassword,
      name,
      role: GlobalRole.admin,
      data: {
        emailVerified: true,
      },
    },
  });

  await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: `/reset-password?email=${encodeURIComponent(email)}&welcome=true`,
    },
  });

  return { success: true };
}
