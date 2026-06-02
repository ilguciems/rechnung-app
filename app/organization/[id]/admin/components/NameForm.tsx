"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/app/components";
import { useOrganizationName, useUpdateOrganizationName } from "@/hooks";
import {
  type OrganizationNameType,
  organizationNameSchema,
} from "@/lib/zod-schema";

export default function NameForm() {
  const t = useTranslations("organization.nameForm");
  const { data: organization } = useOrganizationName();
  const { register, handleSubmit, formState, reset } =
    useForm<OrganizationNameType>({
      resolver: zodResolver(organizationNameSchema),
      defaultValues: {
        name: organization?.name || "",
      },
    });

  useEffect(() => {
    if (organization)
      reset({
        name: organization.name,
      });
  }, [reset, organization]);

  const updateName = useUpdateOrganizationName();

  const onSubmit = (data: OrganizationNameType) => {
    updateName.mutate(data);
  };

  return (
    <section className="border border-gray-100 p-4 rounded-xl dark:bg-gray-950 dark:border-gray-700">
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">{t("title")}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label={t("name")}
            className="mb-4"
            name="name"
            type="text"
            register={register}
            errors={formState.errors}
            bgWhite
          />
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={updateName.isPending}
          >
            {updateName.isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </div>
    </section>
  );
}
