"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Input, LinkButton, Output } from "@/app/components";
import { signUp } from "@/lib/auth-client";
import { type SignUpType, signUpSchema } from "@/lib/zod-schema";

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const { register, handleSubmit, formState, reset } = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: token ? decodeURIComponent(email as string) : "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpType) {
    const { name, email, password } = values;
    await signUp.email(
      {
        name,
        email,
        password,
        callbackURL: token
          ? `/organization/invite/?token=${token}`
          : "/sign-in",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          toast.success("Konto erstellt!");
        },
        onCallback: () => {
          reset();
          setLoading(false);
        },
        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message);
        },
      },
    );
  }

  return (
    <div className="relative isolate">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
          <div className="w-[320px] bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-6">
                  Benutzerkonto erstellen
                </h3>
                {token ? (
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 bg-red-100 dark:bg-red-950/50 p-2 rounded">
                    Sie haben eine Einladung zur Organisation erhalten.
                    Erstellen Sie ein Konto, um die Einladung zu akzeptieren.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Bitte geben Sie Ihre Daten ein.
                  </p>
                )}
              </div>
              <Input
                name="name"
                label="Name"
                register={register}
                errors={formState.errors}
                bgWhite
              />
              {token ? (
                <Output
                  name="email"
                  label="Email"
                  register={register}
                  errors={formState.errors}
                  bgWhite
                />
              ) : (
                <Input
                  name="email"
                  label="Email"
                  register={register}
                  errors={formState.errors}
                  bgWhite
                />
              )}

              <Input
                name="password"
                label="Passwort"
                register={register}
                errors={formState.errors}
                type="password"
                bgWhite
              />

              <Input
                name="confirmPassword"
                label="Passwort bestätigen"
                register={register}
                errors={formState.errors}
                type="password"
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
                  Erstellen
                </Button>
                {!token && (
                  <>
                    <hr className="w-full border-t-2 border-gray-200 dark:border-gray-800" />
                    <LinkButton href="/sign-in" variant="secondary" size="full">
                      Ich habe bereits ein Konto
                    </LinkButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-50 flex items-center justify-center rounded-xl">
          <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
        </div>
      )}
    </div>
  );
}
