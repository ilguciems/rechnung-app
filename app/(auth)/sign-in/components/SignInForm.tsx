"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { signIn, useSession } from "@/lib/auth-client";
import { type SignInType, signInSchema } from "@/lib/zod-schema";
import Input from "../../../components/Input";

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const reason = searchParams.get("reason");

  const { register, handleSubmit, formState, reset } = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (session) {
      const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/";
      window.location.href = destination;
    }
  }, [session, callbackUrl]);

  useEffect(() => {
    if (reason === "session_expired") {
      toast.error(
        "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
        {
          id: "session-expired-toast",
        },
      );
    }
  }, [reason]);

  async function onSubmit(values: SignInType) {
    const { email, password } = values;

    const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/";

    await signIn.email(
      {
        email,
        password,
        callbackURL: destination,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          await fetch("/api/timer/reset", { method: "POST" });
          window.location.href = destination;
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
              `/refresh-email-verification?email=${encodeURIComponent(email)}`,
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
          <div className="w-[320px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 leading-6">
                  Einloggen
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein, um
                  sich anzumelden.
                </p>
              </div>
              <Input
                name="email"
                type="email"
                label="E-Mail"
                register={register}
                errors={formState.errors}
                bgWhite
              />
              <Input
                name="password"
                type="password"
                label="Passwort"
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
                  Einloggen
                </button>
                <hr className="w-full border-t-2 border-gray-200" />
                <Link
                  href="/sign-up"
                  className="w-full py-2 px-4 rounded-md font-medium text-sm transition-colors text-center duration-200
                               bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  Ich habe kein Konto
                </Link>
                <Link
                  href="/forgot-password"
                  className="w-full py-2 px-4 rounded-md font-medium text-sm transition-colors text-center duration-200
                               bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  Ich habe mein Passwort vergessen
                </Link>
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
