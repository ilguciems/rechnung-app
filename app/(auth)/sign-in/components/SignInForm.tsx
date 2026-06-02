"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Input, LinkButton, Output } from "@/app/components";
import { useAuth } from "@/hooks";
import { signIn } from "@/lib/auth-client";
import { type SignInType, signInSchema } from "@/lib/zod-schema";

export default function SignInForm() {
  const t = useTranslations("auth.signIn");
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const reason = searchParams.get("reason");
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const { register, handleSubmit, formState, reset } = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: token ? decodeURIComponent(email as string) : "",
      password: "",
    },
  });

  useEffect(() => {
    if (session && !token && callbackUrl) {
      window.location.href = decodeURIComponent(callbackUrl);
    }
  }, [session, token, callbackUrl]);

  useEffect(() => {
    if (reason === "session_expired") {
      toast.error(t("sessionExpired"), {
        id: "session-expired-toast",
      });
    }
  }, [reason, t]);

  async function onSubmit(values: SignInType) {
    const { email, password } = values;

    const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/";

    await signIn.email(
      {
        email,
        password,
        callbackURL: token
          ? `/organization/invite?token=${token}`
          : destination,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          await fetch("/api/timer/reset", { method: "POST" });
          window.location.href = token
            ? `/organization/invite?token=${token}`
            : destination;
        },
        onCallback: () => {
          reset();
          setLoading(false);
        },

        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
          if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
            router.push(
              `/refresh-email-verification?email=${encodeURIComponent(email)}${
                token ? `&token=${token}` : ""
              }`,
            );
          }
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
                {token ? (
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 bg-red-100 dark:bg-red-950/50 p-2 rounded">
                    {t("invitationMessage")}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("subtitle")}
                  </p>
                )}
              </div>
              {token ? (
                <Output
                  name="email"
                  label={t("email")}
                  register={register}
                  errors={formState.errors}
                  bgWhite
                />
              ) : (
                <Input
                  name="email"
                  type="email"
                  label={t("email")}
                  register={register}
                  errors={formState.errors}
                  bgWhite
                />
              )}
              <Input
                name="password"
                type="password"
                label={t("password")}
                register={register}
                errors={formState.errors}
                bgWhite
              />
            </div>
            <div className="px-6 pb-6 pt-0">
              <div className="flex flex-col gap-4 w-full">
                <Button type="submit" disabled={loading} variant="primary">
                  {t("submit")}
                </Button>
                <hr className="w-full border-t-2 border-gray-200 dark:border-gray-800" />
                {!token && (
                  <LinkButton href="/sign-up" variant="secondary" size="full">
                    {t("noAccount")}
                  </LinkButton>
                )}
                <LinkButton
                  href={`/forgot-password${token ? `?token=${token}` : ""}`}
                  variant="secondary"
                  size="full"
                >
                  {t("forgotPassword")}
                </LinkButton>
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
