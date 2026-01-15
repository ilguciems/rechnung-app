import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins";
import { prisma } from "@/lib/prisma-client";
import {
  GLOBAL_ADMIN_ROLES,
  GLOBAL_PROTECTED_ROLES,
  GlobalRole,
  type GlobalValidRole,
} from "@/types/global-roles";
import { sendAuthorizationEmail } from "@/utils/authorization-email";
import { ac, admin, superadmin, user } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const decodedUrl = decodeURIComponent(url);
      const isWelcome = decodedUrl.includes("welcome=true");

      const subject = isWelcome
        ? "Willkommen! Aktivieren Sie Ihr Admin-Konto"
        : "Setzen Sie Ihr Passwort zurück";

      const text = isWelcome
        ? `Hallo ${user.name},\n\nIhr Admin-Konto wurde erstellt. Bitte setzen Sie Ihr Passwort über den folgenden Link, um den Zugang zu aktivieren:\n\n${url}`
        : `Hallo ${user.name},\n\nKlicken Sie auf den unten stehenden Link, um Ihr Passwort zurückzusetzen:\n\n${url}`;

      await sendAuthorizationEmail({
        to: user.email,
        subject,
        text,
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
                role: GlobalRole.superadmin,
              },
            };
          }
        },
      },
      update: {
        before: async (_, ctx) => {
          const userId = ctx?.body?.userId as string;
          const sessionUser = ctx?.context.session?.user;

          if (!userId) return;

          const user = await prisma.user.findUnique({
            where: { id: userId as string },
            select: { role: true },
          });

          if (
            user?.role &&
            GLOBAL_PROTECTED_ROLES.includes(user.role as GlobalValidRole)
          ) {
            console.error(
              `[SECURITY] Blocked modification of Superadmin: ${userId} from ${sessionUser?.email}`,
            );
            throw new APIError("FORBIDDEN", {
              message: "This protected account cannot be modified.",
            });
          }
        },
      },
      delete: {
        before: async (_, ctx) => {
          const userId = ctx?.body?.userId as string | undefined;
          const sessionUser = ctx?.context.session?.user;
          if (!userId) return;

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });

          if (
            user?.role &&
            GLOBAL_PROTECTED_ROLES.includes(user.role as GlobalValidRole)
          ) {
            console.warn(
              `[SECURITY] Blocked DELETE on Superadmin: ${userId} from ${sessionUser?.email}`,
            );

            throw new APIError("FORBIDDEN", {
              message: "This protected account cannot be deleted.",
            });
          }
        },
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        superadmin,
        admin,
        user,
      },
      adminRole: GLOBAL_ADMIN_ROLES,
      defaultRole: GlobalRole.user,
    }),
    nextCookies(),
  ],
});
