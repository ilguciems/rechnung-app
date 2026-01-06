"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { requestPasswordReset } from "@/lib/auth-client";
import {
  type ForgotPasswordType,
  forgotPasswordSchema,
} from "@/lib/zod-schema";
import { Input } from "../../../components";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { register, handleSubmit, formState, reset } =
    useForm<ForgotPasswordType>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: {
        email: "",
      },
    });

  async function onSubmit(values: ForgotPasswordType) {
    const { email } = values;
    await requestPasswordReset(
      {
        email,
        redirectTo: `/reset-password${token ? `?inviteToken=${token}` : ""}`,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          reset();
          setLoading(false);
          router.push(
            `/forgot-password-email-sent?email=${encodeURIComponent(email)}`,
          );
        },
        onError: () => {
          toast.error("Fehler beim Senden der E-Mail");
          setLoading(false);
        },
      },
    );
  }

  return (
    <div className="relative isolate">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
          <div className="w-[320px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 leading-6">
                  Passwort vergessen
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bitte geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort
                  zurückzusetzen
                </p>
              </div>
              <Input
                type="email"
                name="email"
                label="E-Mail"
                register={register}
                errors={formState.errors}
                bgWhite
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
                  Passwort zurücksetzen
                </button>
                <hr className="w-full border-t-2 border-gray-200" />
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full py-2 px-4 rounded-md font-medium text-sm transition-colors text-center duration-200
                               bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl">
          <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
        </div>
      )}
    </div>
  );
}
