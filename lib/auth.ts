import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/prisma-client";
import { sendAuthorizationEmail } from "@/utils/authorization-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthorizationEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthorizationEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Hello ${user.name},\n\nClick the link below to verify your email:\n\n${url}`,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const usersCount = await prisma.user.count();

          if (usersCount === 0) {
            return {
              data: {
                ...user,
                role: "admin",
              },
            };
          }
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
    }),
    nextCookies(),
  ],
});
