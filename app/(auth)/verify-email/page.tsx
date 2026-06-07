import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { emailVerificationSchema } from "@/lib/zod-schema";

export default async function VerifyEmail({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const rawEmail = (await searchParams).email;
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail || "";

  if (session || !emailVerificationSchema.safeParse({ email }).success)
    redirect("/");

  const t = await getTranslations("auth.verifyEmail");

  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <h1 className="text-2xl mb-4 text-center">{t("title")}</h1>
        <ul>
          <li>- {t("messageSent", { email })}</li>
          <li>- {t("checkSpam")}</li>
          <li>- {t("resendIfNotReceived")}</li>
        </ul>
        <h2 className="mt-4 text-center">{t("closeWindow")}</h2>
      </div>
    </div>
  );
}
