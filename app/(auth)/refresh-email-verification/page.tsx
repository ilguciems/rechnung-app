import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { emailVerificationSchema } from "@/lib/zod-schema";
import ResfreshVerificationForm from "./components/RefreshVerificationForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const email = ((await searchParams).email as string) || "";

  if (session || !emailVerificationSchema.safeParse({ email }).success)
    redirect("/");

  return <ResfreshVerificationForm email={email} />;
}
