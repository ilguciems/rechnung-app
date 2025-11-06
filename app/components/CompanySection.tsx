"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
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
  const queryClient = useQueryClient();
  const [vatToggledByUser, setVatToggledByUser] = useState(false);

  // Load company
  const { data: company } = useQuery<Company>({
    queryKey: ["company"],
    queryFn: async () => {
      const res = await fetch(ROUTES.COMPANY);
      if (!res.ok) throw new Error("Fehler beim Laden der Firma");
      return res.json();
    },
  });

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
      setValue("handelsregisternummer", "");
      clearErrors("handelsregisternummer");
    }
  }, [setValue, clearErrors, isHandelsregisterRequired]);

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
    if (vatToggledByUser) {
      if (isSubjectToVAT) {
        setValue("firstTaxRate", getValues("firstTaxRate") ?? 19, {
          shouldDirty: true,
        });
        setValue("secondTaxRate", getValues("secondTaxRate") ?? 7, {
          shouldDirty: true,
        });

        setFocus("firstTaxRate");
      } else {
        setValue("firstTaxRate", null, { shouldDirty: true });
        setValue("secondTaxRate", null, { shouldDirty: true });
        clearErrors(["firstTaxRate", "secondTaxRate"]);
      }

      setVatToggledByUser(false);
    }
  }, [
    vatToggledByUser,
    isSubjectToVAT,
    setValue,
    getValues,
    clearErrors,
    setFocus,
  ]);

  const saveCompany = useMutation({
    mutationFn: async (form: Partial<Company>) => {
      const method = company ? "PATCH" : "POST";
      const res = await fetch(ROUTES.COMPANY, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern der Firma");
      return res.json();
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["company"] });
      const prev = queryClient.getQueryData<Company>(["company"]);
      queryClient.setQueryData(["company"], { ...prev, ...newData });
      return { prev };
    },
    onError: (_err, _newData, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["company"], ctx.prev);
      toast.error("Fehler beim Speichern");
    },
    onSuccess: (newCompany) => {
      queryClient.setQueryData(["company"], newCompany);
      toast.success("Unternehmensdaten gespeichert!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });

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
      className="p-4 mb-6 rounded-xl shadow bg-gray-100"
    >
      <h2 id="company-section" className="text-lg font-bold mb-4">
        {company ? "Firmendaten bearbeiten" : "Firmendaten eingeben"}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input<Company>
            name="name"
            label="Firmenname"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <SelectField<Company>
            className="col-span-2 sm:col-span-1"
            name="legalForm"
            label="Rechtsform"
            options={legalFormsOptions}
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="street"
            label="Straße"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="houseNumber"
            label="Hausnummer"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="zipCode"
            label="PLZ"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="city"
            label="Ort"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="country"
            label="Land"
            className="col-span-2"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="phone"
            type="phone"
            label="Telefon"
            className="col-span-2 sm:col-span-1"
            setValue={setValue}
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="email"
            label="E-Mail"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
            type="email"
          />
          <Input<Company>
            name="bank"
            label="Bank"
            className="col-span-2"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="iban"
            type="iban"
            label="IBAN"
            className="col-span-2 sm:col-span-1"
            setValue={setValue}
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="bic"
            label="BIC"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="handelsregisternummer"
            label={`${
              isHandelsregisterRequired ? "" : ""
            }Handelsregisternummer${
              !isHandelsregisterRequired ? " (optional)" : ""
            }`}
            className="col-span-2"
            register={register}
            errors={errors}
          />
          <Input<Company>
            name="steuernummer"
            label="Steuernummer *"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
            aria-describedby="tax-either"
          />
          <Input<Company>
            name="ustId"
            label="Umsatzsteuer-Identifikationsnummer *"
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
            aria-describedby="tax-either"
          />
          <p id="tax-either" className="col-span-2 text-xs text-gray-700">
            * Sie können entweder Steuernummer oder
            Umsatzsteuer-Identifikationsnummer eingeben.
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
          <label htmlFor="isSubjectToVAT" className="text-sm text-gray-700">
            {isVatRequired
              ? "Diese Rechtsform ist umsatzsteuerpflichtig."
              : "Mein Unternehmen ist umsatzsteuerpflichtig."}
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
                label="Zweiter Steuersatz in %"
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
          className="mt-4 px-3 py-1 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px] cursor-pointer"
          disabled={isSubmitting || saveCompany.isPending || !isDirty}
        >
          {saveCompany.isPending || isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <span>Speichern</span>
          )}
        </button>
      </form>
    </section>
  );
}
