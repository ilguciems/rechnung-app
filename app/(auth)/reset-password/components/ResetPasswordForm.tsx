"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/auth-client";
import { type ResetPasswordType, resetPasswordSchema } from "@/lib/zod-schema";
import Input from "../../../components/Input";

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") as string;
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
          router.push("/sign-in");
          toast.success("Password reset successful!");
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
                  Passwort zur&uuml;cksetzen
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bitte geben Sie ein neues Passwort ein.
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
                  Passwort zur&uuml;cksetzen
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Loading...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
