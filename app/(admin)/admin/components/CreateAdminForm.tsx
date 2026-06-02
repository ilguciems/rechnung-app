"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { Button, Input } from "@/app/components";
import { createAdminAction } from "../actions/createAdminAction";

const createAdminSchema = z.object({
  email: z.email("Ungültige E-Mail-Adresse"),
  name: z.string().min(2, "Name ist zu kurz"),
});

type CreateAdminValues = z.infer<typeof createAdminSchema>;

export default function CreateAdminForm() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAdminValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { email: "", name: "" },
  });

  const onSubmit = async (values: CreateAdminValues) => {
    setLoading(true);
    try {
      await createAdminAction(values);
      toast.success(t("createSuccess"));
      reset();
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error instanceof Error && error.message) || t("createError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border border-gray-100 p-4 rounded-xl dark:bg-gray-950">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            {t("title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("name")}
            name="name"
            register={register}
            errors={errors}
            bgWhite
          />

          <Input
            label={t("email")}
            name="email"
            type="email"
            register={register}
            errors={errors}
            bgWhite
          />

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="full"
          >
            <span className="flex items-center justify-center gap-2 transition-all">
              <Mail className="w-4 h-4" />
              {t("invite")}
            </span>
          </Button>
        </form>
      </div>
    </section>
  );
}
