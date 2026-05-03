import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin as adminRole, superadmin, user } from "./permissions";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  changePassword,
  changeEmail,
  admin,
} = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        superadmin,
        admin: adminRole,
        user,
      },
    }),
  ],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});
