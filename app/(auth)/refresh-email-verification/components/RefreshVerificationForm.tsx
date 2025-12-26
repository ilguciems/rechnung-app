"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { sendVerificationEmail } from "@/lib/auth-client";
import {
  emailVerificationSchema,
  type emailVerificationType,
} from "@/lib/zod-schema";
import { Output } from "../../../components";

export default function ResfreshVerificationForm({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset, formState } =
    useForm<emailVerificationType>({
      resolver: zodResolver(emailVerificationSchema),
      defaultValues: {
        email,
      },
    });
  async function onSubmit(values: emailVerificationType) {
    const { email } = values;
    setLoading(true);

    try {
      await sendVerificationEmail(
        {
          email,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            reset();
            toast.success("E-Mail erfolgreich versendet");
            router.push("/verify-email");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Fehler beim Senden der E-Mail");
          },
        },
      );
    } catch (error) {
      toast.error(`Ein unerwarteter Fehler ist aufgetreten: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
          <div className="w-[320px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 leading-6">
                  Bestätigungslink erneut senden
                </h3>
                <p className="mt-1 text-xs text-red-500">
                  Sie haben Ihre E-Mail-Adresse nicht rechtzeitig bestätigt und
                  können sich daher nicht anmelden. Bitte klicken Sie auf den
                  Button unten, um einen neuen Link zu Ihrer E-Mail zu erhalten.
                </p>
              </div>
              <Output
                name="email"
                label="E-Mail"
                register={register}
                bgWhite
                errors={formState.errors}
              />
            </div>
            <div className="px-6 pb-6 pt-0">
              <div className="flex flex-col gap-4 w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer
                    bg-black text-white hover:bg-gray-800
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Bestätigungslink erneut senden
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl">
          <span className="text-sm font-medium text-gray-700">Loading...</span>
        </div>
      )}
    </div>
  );
}
