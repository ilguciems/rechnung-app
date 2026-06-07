"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Input } from "@/app/components";
import { requestPasswordReset } from "@/lib/auth-client";
import {
  type ForgotPasswordType,
  forgotPasswordSchema,
} from "@/lib/zod-schema";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
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
          toast.error(t("errorSendingEmail"));
          setLoading(false);
        },
      },
    );
  }

  return (
    <div className="relative isolate">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
          <div className="w-[320px] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-6">
                  {t("title")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t("subtitle")}
                </p>
              </div>
              <Input
                type="email"
                name="email"
                label={t("email")}
                register={register}
                errors={formState.errors}
                bgWhite
              />
            </div>
            <div className="px-6 pb-6 pt-0">
              <div className="flex flex-col gap-4 w-full">
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="full"
                >
                  {t("submit")}
                </Button>
                <hr className="w-full border-t-2 border-gray-200 dark:border-gray-800" />
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="secondary"
                  size="full"
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 z-50 flex items-center justify-center rounded-xl">
          <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
        </div>
      )}
    </div>
  );
}
