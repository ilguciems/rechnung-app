import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { emailVerificationSchema } from "@/lib/zod-schema";

export default async function ForgotPasswordEmailSent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("auth.forgotPasswordEmailSent");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const email = (await searchParams).email || "";

  if (session || !emailVerificationSchema.safeParse({ email }).success)
    redirect("/");
  return (
    <div className="flex h-screen">
      <div className="m-auto">
        {t("title")}
        <ul>
          <li>
            - {t("sentToPrefix")} <span className="font-semibold">{email}</span>{" "}
            {t("sentToSuffix")}
          </li>
          <li>- {t("checkSpam")}</li>
          <li>- {t("resendIfNotReceived")}</li>
        </ul>
        <h2 className="mt-4 text-center">{t("closeWindow")}</h2>
      </div>
    </div>
  );
}
