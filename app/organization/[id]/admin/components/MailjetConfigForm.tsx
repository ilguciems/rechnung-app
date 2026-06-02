"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, ConfirmationModal, Input } from "@/app/components";
import { useMailConfig, useMailConfigData } from "@/hooks";
import {
  type OrganizationConfigMailType,
  organizationConfigMailSchema,
} from "@/lib/zod-schema";

export default function MailJetConfigForm() {
  const t = useTranslations("organization.mailjet");
  const { data: config } = useMailConfigData();
  const { updateOrCreateMailConfig, deleteMailConfig } = useMailConfig(
    Boolean(config),
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    setError,
  } = useForm<OrganizationConfigMailType>({
    resolver: zodResolver(organizationConfigMailSchema),
    defaultValues: {
      publicKeyEnc: "",
      privateKeyEnc: "",
      fromEmail: config?.fromEmail || "",
      fromName: config?.fromName || "",
      isEnabled: config?.isEnabled || false,
    },
  });

  useEffect(() => {
    if (config)
      reset({
        publicKeyEnc: "",
        privateKeyEnc: "",
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        isEnabled: config.isEnabled || false,
      });
  }, [reset, config]);

  const onSubmit = async (data: OrganizationConfigMailType) => {
    if (!config) {
      // Creating new config - validate all required fields
      if (!data.publicKeyEnc) {
        setError("publicKeyEnc", { message: t("errors.publicKey") });
        return;
      }
      if (!data.privateKeyEnc) {
        setError("privateKeyEnc", { message: t("errors.privateKey") });
        return;
      }
      if (!data.fromEmail) {
        setError("fromEmail", { message: t("errors.fromEmail") });
        return;
      }
      if (!data.fromName) {
        setError("fromName", { message: t("errors.fromName") });
        return;
      }

      // Send all fields for new config
      await updateOrCreateMailConfig.mutateAsync({
        publicKeyEnc: data.publicKeyEnc,
        privateKeyEnc: data.privateKeyEnc,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        isEnabled: !!data.isEnabled,
      });
      return;
    }

    // Updating existing config - send only dirty fields
    const payload: Partial<OrganizationConfigMailType> = {};

    for (const key of Object.keys(dirtyFields)) {
      payload[key as keyof OrganizationConfigMailType] = data[
        key as keyof OrganizationConfigMailType
      ] as unknown as undefined;
    }

    const result = {
      ...payload,
      isEnabled: !!payload.isEnabled,
    };

    await updateOrCreateMailConfig.mutateAsync(result);
  };

  const onDelete = async () => {
    await deleteMailConfig.mutateAsync();
    reset({
      publicKeyEnc: "",
      privateKeyEnc: "",
      fromEmail: "",
      fromName: "",
      isEnabled: false,
    });
    setIsDeleteModalOpen(false);
  };

  return (
    <section
      id="mail-config"
      className="border border-gray-100 p-4 rounded-xl mt-2 dark:bg-gray-950 dark:border-gray-700"
    >
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">{t("title")}</h2>
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t.rich("description", {
              link: (chunks) => (
                <Link
                  href="https://app.mailjet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label={t("senderName")}
            className="mb-4"
            name="fromName"
            type="text"
            register={register}
            errors={errors}
            bgWhite
          />
          <Input
            label={t("senderEmail")}
            className="mb-4"
            name="fromEmail"
            type="text"
            register={register}
            errors={errors}
            bgWhite
          />
          <Input
            label={t("publicKey")}
            className="mb-4"
            name="publicKeyEnc"
            type="text"
            placeholder={
              config?.isPublicKeySet
                ? t("placeholderMasked")
                : t("placeholderNotSet")
            }
            register={register}
            errors={errors}
            bgWhite
          />
          <Input
            label={t("privateKey")}
            className="mb-4"
            name="privateKeyEnc"
            type="text"
            placeholder={
              config?.isPrivateKeySet
                ? t("placeholderMasked")
                : t("placeholderNotSet")
            }
            register={register}
            errors={errors}
            bgWhite
          />
          <div className="flex items-center gap-2 p-2 my-3">
            <input
              className="w-4 h-4"
              type="checkbox"
              id="isEnabled"
              {...register("isEnabled")}
            />
            <label htmlFor="isEnabled">{t("enabled")}</label>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={
              updateOrCreateMailConfig.isPending || !isDirty || isSubmitting
            }
          >
            {updateOrCreateMailConfig.isPending ? t("saving") : t("save")}
          </Button>
        </form>
        {config && (
          <Button
            type="button"
            variant="primary"
            size="full"
            disabled={deleteMailConfig.isPending}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {deleteMailConfig.isPending ? t("saving") : t("delete")}
          </Button>
        )}
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDelete}
        title={t("deleteTitle")}
        description={t("deleteConfirm")}
        confirmText={t("delete")}
        isPending={deleteMailConfig.isPending}
      />
    </section>
  );
}
