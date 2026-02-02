"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/app/components";
import { useMailConfig, useMailConfigData } from "@/hooks";
import {
  type OrganizationConfigMailType,
  organizationConfigMailSchema,
} from "@/lib/zod-schema";

export default function MailJetConfigForm() {
  const { data: config } = useMailConfigData();
  const { updateOrCreateMailConfig, deleteMailConfig } = useMailConfig(
    Boolean(config),
  );
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
      if (!data.publicKeyEnc) {
        setError("publicKeyEnc", { message: "Public key ist erförderlich" });
        return;
      }
      if (!data.privateKeyEnc) {
        setError("privateKeyEnc", { message: "Private key ist erförderlich" });
        return;
      }
    }

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
  };

  return (
    <section
      id="mail-config"
      className="border border-gray-100 p-4 rounded-xl mt-2"
    >
      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <h2 className="text-2xl mb-6">MailJet Konfiguration</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Absender Name"
            className="mb-4"
            name="fromName"
            type="text"
            register={register}
            errors={errors}
            bgWhite
          />
          <Input
            label="Absender Email"
            className="mb-4"
            name="fromEmail"
            type="text"
            register={register}
            errors={errors}
            bgWhite
          />
          <Input
            label="Public Key"
            className="mb-4"
            name="publicKeyEnc"
            type="text"
            placeholder={`${config?.isPublicKeySet ? "***** ****** ***** *****" : "nicht gesetzt"}`}
            register={register}
            errors={errors}
            bgWhite
          />
          <Input
            label="Private Key"
            className="mb-4"
            name="privateKeyEnc"
            type="text"
            placeholder={`${config?.isPrivateKeySet ? "***** ****** ***** *****" : "nicht gesetzt"}`}
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
            <label htmlFor="isEnabled">Aktiviert</label>
          </div>
          <button
            type="submit"
            className="block w-full bg-black text-sm font-medium text-white py-2 rounded mt-4 cursor-pointer hover:bg-black-900"
            disabled={
              updateOrCreateMailConfig.isPending || !isDirty || isSubmitting
            }
          >
            {updateOrCreateMailConfig.isPending ? "Lade..." : "Speichern"}
          </button>
        </form>
        {config && (
          <button
            type="button"
            className="block w-full bg-black text-sm font-medium text-white py-2 rounded mt-4 cursor-pointer hover:bg-black-900"
            onClick={onDelete}
          >
            {deleteMailConfig.isPending ? "Lade..." : "Löschen"}
          </button>
        )}
      </div>
    </section>
  );
}
