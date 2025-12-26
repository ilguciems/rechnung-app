import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

  const email = (await searchParams).email || "";

  if (session || !emailVerificationSchema.safeParse({ email }).success)
    redirect("/");

  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <h1 className="text-2xl mb-4 text-center">
          E-Mail-Bestätigung erforderlich.
        </h1>
        <ul>
          <li>
            - Wir haben Ihnen eine Bestätigungs-E-Mail an{" "}
            <span className="font-semibold">{email}</span> gesendet. Bitte
            klicken Sie auf den Link in der E-Mail, um Ihre Registrierung
            abzuschließen.
          </li>
          <li>
            - Falls Sie die E-Mail nicht erhalten haben, überprüfen Sie bitte
            Ihren Spam-Ordner.
          </li>
          <li>
            - Falls Sie die E-Mail nicht innerhalb weniger Minuten erhalten
            haben, überprüfen Sie bitte Ihre E-Mail-Adresse und versuchen Sie es
            erneut.
          </li>
        </ul>
        <h2 className="mt-4 text-center">
          Sie können dieses Fenster jetzt schließen.
        </h2>
      </div>
    </div>
  );
}
