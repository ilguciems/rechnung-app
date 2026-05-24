"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, SelectField } from "@/app/components";
import { useSendInvite } from "@/hooks";
import { type SendInviteType, sendInviteSchema } from "@/lib/zod-schema";

export default function SendInviteForm() {
  const t = useTranslations("organization.invitations");
  const { register, handleSubmit, formState, reset } = useForm<SendInviteType>({
    resolver: zodResolver(sendInviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const roleOptions = useMemo(
    () => [
      { value: "member", label: t("memberRole") },
      { value: "admin", label: t("adminRole") },
    ],
    [t],
  );

  const createInvoice = useSendInvite(() => reset());

  const onSubmit = (data: SendInviteType) => {
    createInvoice.mutate(data);
  };

  return (
    <section className="border border-gray-100 p-4 rounded-xl dark:bg-black dark:border-gray-700">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">{t("send")}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label={t("email")}
            className="mb-4"
            name="email"
            type="email"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <SelectField
            label={t("role")}
            className="mb-4"
            name="role"
            register={register}
            errors={formState.errors}
            bgWhite
            options={roleOptions}
          />
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={createInvoice.isPending}
          >
            {createInvoice.isPending ? t("sending") : t("send")}
          </Button>
        </form>
      </div>
    </section>
  );
}
