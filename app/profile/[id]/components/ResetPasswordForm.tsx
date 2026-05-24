"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Input } from "@/app/components";
import { changePassword } from "@/lib/auth-client";
import {
  type ChangePasswordType,
  changePasswordSchema,
} from "@/lib/zod-schema";

export default function ResetPasswordForm() {
  const t = useTranslations("profile.changePassword");
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
            toast.success(t("success"));
            reset();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || t("error"));
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
    <section className="border border-gray-100 p-4 rounded-xl dark:bg-black">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">{t("title")}</h2>
        <form onSubmit={handleSubmit(handleChangePassword)}>
          <Input
            label={t("currentPassword")}
            className="mb-4"
            name="currentPassword"
            type="password"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <Input
            label={t("newPassword")}
            className="mb-4"
            name="newPassword"
            type="password"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <Input
            label={t("confirmNewPassword")}
            className="mb-4"
            name="confirmPassword"
            type="password"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={isLoading}
          >
            {t("submit")}
          </Button>
        </form>
      </div>
    </section>
  );
}
