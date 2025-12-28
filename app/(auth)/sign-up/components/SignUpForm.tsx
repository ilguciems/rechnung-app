"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { signUp } from "@/lib/auth-client";
import { type SignUpType, signUpSchema } from "@/lib/zod-schema";
import Input from "../../../components/Input";

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState, reset } = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
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
        callbackURL: "/sign-in",
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
          <div className="w-[320px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 leading-6">
                  Benutzerkonto erstellen
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bitte geben Sie Ihre Daten ein
                </p>
              </div>
              <Input
                name="name"
                label="Name"
                register={register}
                errors={formState.errors}
                bgWhite
              />
              <Input
                name="email"
                label="Email"
                register={register}
                errors={formState.errors}
                bgWhite
              />

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
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 border cursor-pointer
                    ${
                      loading
                        ? "bg-transparent text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-black text-white border-transparent hover:bg-gray-800"
                    }`}
                >
                  Erstellen
                </button>
                <hr className="w-full border-t-2 border-gray-200" />
                <Link
                  href="/sign-in"
                  className="w-full py-2 px-4 rounded-md font-medium text-sm transition-colors text-center duration-200
                               bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  Ich habe bereits ein Konto
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
