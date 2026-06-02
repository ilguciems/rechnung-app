"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCompany, useSaveCompany } from "@/hooks";
import { formatPhone } from "@/lib/phone-utils";
import {
  type Company,
  companySchema,
  HANDELSREGISTER_REQUIRED_FORMS,
  VAT_REQUIRED_FORMS,
} from "@/lib/zod-schema";
import Input from "./Input";
import { SelectField } from "./SelectField";

const legalFormsOptions = [
  { label: "Kleingewerbe", value: "KLEINGEWERBE" },
  { label: "Freiberufler", value: "FREIBERUFLER" },
  { label: "GbR", value: "GBR" },
  { label: "Einzelkaufmann", value: "EINZELKAUFMANN" },
  { label: "OhG", value: "OHG" },
  { label: "KG", value: "KG" },
  { label: "Gmbh & Co. KG", value: "GMBH_CO_KG" },
  { label: "GmbH", value: "GMBH" },
  { label: "UG", value: "UG" },
  { label: "AG", value: "AG" },
  { label: "KGaA", value: "KGaA" },
  { label: "SE", value: "SE" },
  { label: "EWIV", value: "EWIV" },
];

export default function CompanySection() {
  const t = useTranslations("company");
  const [vatToggledByUser, setVatToggledByUser] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Load company
  const { data: company } = useCompany();
  // Save company
  const saveCompany = useSaveCompany(company);

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    watch,
    setValue,
    reset,
    clearErrors,
    setFocus,
    getValues,
  } = useForm<Company>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      zipCode: "",
      houseNumber: "",
      country: "Deutschland",
      phone: "",
      email: "",
      iban: "",
      bic: "",
      bank: "",
      isSubjectToVAT: false,
      firstTaxRate: null,
      secondTaxRate: null,
      logoUrl: "",
      legalForm: "KLEINGEWERBE",
      steuernummer: "",
      ustId: "",
      handelsregisternummer: "",
    },
  });

  const legalForm = watch("legalForm");
  const isVatRequired = VAT_REQUIRED_FORMS.includes(legalForm);
  const isHandelsregisterRequired =
    HANDELSREGISTER_REQUIRED_FORMS.includes(legalForm);

  const handleVatToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVatToggledByUser(true);

    setValue("isSubjectToVAT", e.target.checked, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  useEffect(() => {
    if (isVatRequired) {
      setValue("isSubjectToVAT", true, {
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      setValue("isSubjectToVAT", false, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [isVatRequired, setValue]);

  useEffect(() => {
    if (!isHandelsregisterRequired) {
      clearErrors("handelsregisternummer");
    }
  }, [clearErrors, isHandelsregisterRequired]);

  useEffect(() => {
    if (company)
      reset({
        ...company,
        phone: formatPhone(company.phone),
        firstTaxRate: company.firstTaxRate || 19,
        secondTaxRate: company.secondTaxRate || 7,
      });
  }, [company, reset]);

  const isSubjectToVAT = watch("isSubjectToVAT");

  useEffect(() => {
    if (!isSubjectToVAT) {
      setValue("firstTaxRate", null, { shouldDirty: true });
      setValue("secondTaxRate", null, { shouldDirty: true });
      clearErrors(["firstTaxRate", "secondTaxRate"]);
      return;
    }
    const first = company?.firstTaxRate ?? 19;
    const second = company?.secondTaxRate ?? 7;
    if (!getValues("firstTaxRate")) {
      setValue("firstTaxRate", first, { shouldDirty: true });
    }

    if (!getValues("secondTaxRate")) {
      setValue("secondTaxRate", second, { shouldDirty: true });
    }
    if (vatToggledByUser) {
      setFocus("firstTaxRate");
      setVatToggledByUser(false);
    }
  }, [
    isSubjectToVAT,
    company?.firstTaxRate,
    company?.secondTaxRate,
    vatToggledByUser,
    setValue,
    getValues,
    clearErrors,
    setFocus,
  ]);

  // Submit
  const onSubmit = handleSubmit(async (data) => {
    const payload: Partial<Company> = {};

    for (const key of Object.keys(dirtyFields)) {
      payload[key as keyof Company] = data[
        key as keyof Company
      ] as unknown as undefined;
    }

    payload.firstTaxRate = isSubjectToVAT ? data.firstTaxRate : null;
    payload.secondTaxRate = isSubjectToVAT ? data.secondTaxRate : null;

    await saveCompany.mutateAsync(payload);
  });

  return (
    <section
      aria-labelledby="company-section"
      className="p-4 mb-6 rounded-xl shadow bg-gray-100 dark:bg-gray-950 dark:text-white"
    >
      <h2 id="company-section" className="text-lg font-bold mb-4">
        {company ? t("editTitle") : t("newTitle")}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input<Company>
            name="name"
            label={t("name")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <SelectField<Company>
            className="col-span-2 sm:col-span-1"
            name="legalForm"
            label={t("legalForm")}
            options={legalFormsOptions}
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="street"
            label={t("street")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="houseNumber"
            label={t("houseNumber")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="zipCode"
            label={t("zip")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="city"
            label={t("city")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="country"
            label={t("country")}
            className="col-span-2"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="phone"
            type="phone"
            label={t("phone")}
            className="col-span-2 sm:col-span-1"
            setValue={setValue}
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="email"
            label={t("email")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
            type="email"
          />
          <Input<Company>
            name="bank"
            label={t("bank")}
            className="col-span-2"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="iban"
            type="iban"
            label={t("iban")}
            className="col-span-2 sm:col-span-1"
            setValue={setValue}
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="bic"
            label={t("bic")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="handelsregisternummer"
            label={t("registrationNumber")}
            className="col-span-2"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="steuernummer"
            label={t("taxNumber")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
            aria-describedby="tax-either"
          />
          <Input<Company>
            name="ustId"
            label={t("vatId")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
            aria-describedby="tax-either"
          />
          <p
            id="tax-either"
            className="col-span-2 text-xs text-gray-700 dark:text-gray-300"
          >
            {t("taxNote")}
          </p>
        </div>
        <div className="flex items-center gap-2 p-2 my-3">
          <input
            className="w-4 h-4"
            id="isSubjectToVAT"
            type="checkbox"
            {...register("isSubjectToVAT", {
              onChange: handleVatToggle,
            })}
            aria-controls="vat-rate-fields"
            aria-expanded={isSubjectToVAT}
            disabled={isVatRequired}
          />
          <label
            htmlFor="isSubjectToVAT"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            {isVatRequired ? t("vatLiable") : t("myCompanyVatLiable")}
          </label>
        </div>
        <AnimatePresence initial={false}>
          {isSubjectToVAT && (
            <motion.div
              id="vat-rate-fields"
              key="vat-fields"
              className="grid grid-cols-2 gap-3"
              aria-live="polite"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: "easeInOut" }
              }
            >
              <Input<Company>
                name="firstTaxRate"
                label="Erster Steuersatz in %"
                className="col-span-2 sm:col-span-1"
                inputMode="decimal"
                step="0.01"
                type="number"
                register={register}
                errors={errors}
              />
              <Input<Company>
                name="secondTaxRate"
                label={t("secondTaxRate")}
                className="col-span-2 sm:col-span-1"
                inputMode="decimal"
                step="0.01"
                type="number"
                register={register}
                errors={errors}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="submit"
          className="mt-4 px-3 py-1 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-40 cursor-pointer"
          disabled={isSubmitting || saveCompany.isPending || !isDirty}
        >
          {saveCompany.isPending || isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <span>{t("save")}</span>
          )}
        </button>
      </form>
    </section>
  );
}
