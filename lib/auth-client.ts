import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

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
  plugins: [adminClient()],
  baseURL: "http://localhost:3000",
});
