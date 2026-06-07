"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Output } from "@/app/components";
import { sendVerificationEmail } from "@/lib/auth-client";
import {
  emailVerificationSchema,
  type emailVerificationType,
} from "@/lib/zod-schema";

export default function ResfreshVerificationForm({
  email,
  token,
}: {
  email: string;
  token?: string;
}) {
  const t = useTranslations("auth.refreshEmailVerification");
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
          callbackURL: token ? `/organization/invite?token=${token}` : "/",
        },
        {
          onSuccess: () => {
            reset();
            toast.success(t("toastSuccess"));
            router.push("/verify-email");
          },
          onError: () => {
            toast.error(t("toastErrorSendingEmail"));
          },
        },
      );
    } catch (error) {
      toast.error(t("toastUnexpectedError", { error: String(error) }));
    } finally {
      setLoading(false);
    }
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
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {t("description")}
                </p>
              </div>
              <Output
                name="email"
                label={t("emailLabel")}
                register={register}
                bgWhite
                errors={formState.errors}
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
