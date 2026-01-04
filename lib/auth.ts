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
        subject: "Setzen Sie Ihr Passwort zurück",
        text: `Hallo ${user.name},\n\nKlicken Sie auf den unten stehenden Link, um Ihr Passwort zurückzusetzen:\n\n${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthorizationEmail({
        to: user.email,
        subject: "Bestätigen Sie Ihre E-Mail-Adresse",
        text: `Hallo ${user.name},\n\nKlicken Sie auf den unten stehenden Link, um Ihre E-Mail-Adresse zu bestätigen:\n\n${url}`,
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
