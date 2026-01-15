"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Input } from "@/app/components";
import { resetPassword } from "@/lib/auth-client";
import { type ResetPasswordType, resetPasswordSchema } from "@/lib/zod-schema";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") as string;
  const inviteToken = searchParams.get("inviteToken");
  const isWelcome = searchParams.get("welcome") === "true";
  const { register, handleSubmit, formState, reset } =
    useForm<ResetPasswordType>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: {
        password: "",
        confirmPassword: "",
      },
    });
  async function onSubmit(values: ResetPasswordType) {
    const { password } = values;
    await resetPassword(
      {
        newPassword: password,
        token,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          reset();
          setLoading(false);
          router.push(
            inviteToken
              ? `/organization/invite?token=${inviteToken}`
              : "/sign-in",
          );
          toast.success(
            isWelcome
              ? "Passwort erfolgreich gesetzt!"
              : "Password erfolgreich geändert!",
          );
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      },
    );
  }
  if (!token) redirect("/");
  return (
    <div className="relative isolate">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
          <div className="w-[320px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 leading-6">
                  {isWelcome ? "Konto aktivieren" : "Passwort zurücksetzen"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isWelcome
                    ? "Willkommen! Bitte legen Sie Ihr Passwort fest, um Ihr Konto zu aktivieren."
                    : "Bitte geben Sie ein neues Passwort ein."}
                </p>
              </div>
              <Input
                type="password"
                name="password"
                label="Passwort"
                register={register}
                errors={formState.errors}
                bgWhite
              />
              <Input
                type="password"
                name="confirmPassword"
                label="Passwort best&auml;tigen"
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
                  className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-all border
                    ${
                      loading
                        ? "bg-transparent text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-black text-white border-transparent hover:bg-gray-800 shadow-sm"
                    }`}
                >
                  {isWelcome ? "Passwort festlegen" : "Passwort zurücksetzen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}
