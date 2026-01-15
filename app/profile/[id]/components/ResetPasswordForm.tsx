"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Input } from "@/app/components";
import { changePassword } from "@/lib/auth-client";
import {
  type ChangePasswordType,
  changePasswordSchema,
} from "@/lib/zod-schema";

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState, reset } =
    useForm<ChangePasswordType>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    });

  async function handleChangePassword(values: ChangePasswordType) {
    setIsLoading(true);
    try {
      await changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          onSuccess: () => {
            toast.success("Passwort erfolgreich geändert!");
            reset();
          },
          onError: (ctx) => {
            toast.error(
              ctx.error.message || "Fehler beim Ändern des Passworts",
            );
          },
        },
      );
    } catch (error) {
      toast.error(`Ein unerwarteter Fehler из aufgetreten: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="border border-gray-100 p-4 rounded-xl">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">Passwort ändern</h2>
        <form onSubmit={handleSubmit(handleChangePassword)}>
          <Input
            label="Aktuelles Passwort"
            className="mb-4"
            name="currentPassword"
            type="password"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <Input
            label="Neues Passwort"
            className="mb-4"
            name="newPassword"
            type="password"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <Input
            label="Neues Passwort bestätigen"
            className="mb-4"
            name="confirmPassword"
            type="password"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <button
            type="submit"
            className="block w-full bg-black text-sm font-medium text-white py-2 rounded mt-4 cursor-pointer hover:bg-black-900"
            disabled={isLoading}
          >
            Passwort ändern
          </button>
        </form>
      </div>
    </section>
  );
}
