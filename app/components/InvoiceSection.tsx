"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useAuth, useCompany, useCreateInvoice, useMailStatus } from "@/hooks";
import { ROUTES } from "@/lib/api-routes";
import { type Invoice, invoiceSchema as schema } from "@/lib/zod-schema";
import AutoCompleteInput from "./AutoCompleteInput";
import EmailSettingHint from "./EmailSettingHint";
import Input from "./Input";
import { SelectField } from "./SelectField";

type Product = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number | null | undefined;
};

export default function InvoiceSection() {
  const t = useTranslations("invoice");
  const { data: company } = useCompany();
  const { isOrgAdmin, orgRole, orgId } = useAuth();
  const { data: mailStatus, isLoading: isMailStatusLoading } = useMailStatus();

  const invoiceFormRef = useRef<HTMLDivElement | null>(null);
  const deleteButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const canSendEmail = mailStatus?.canSendEmail ?? false;

  const invoiceSchema = useMemo(() => {
    return schema.superRefine((data, ctx) => {
      if (canSendEmail && (!data.customerEmail || data.customerEmail === "")) {
        ctx.addIssue({
          code: "custom",
          message: t("emailRequired"),
          path: ["customerEmail"],
        });
      }
    });
  }, [canSendEmail, t]);

  useEffect(() => {
    if (company) {
      const timer = setTimeout(() => {
        invoiceFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [company]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    setFocus,
  } = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      customerStreet: "",
      customerHouseNumber: "",
      customerCity: "",
      customerZipCode: "",
      customerCountry: "Deutschland",
      customerEmail: "",
      customerPhone: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: "" as unknown as number,
          taxRate: null,
        },
      ],
    },
  });

  useEffect(() => {
    if (!company) return;

    reset({
      customerName: "",
      customerStreet: "",
      customerHouseNumber: "",
      customerCity: "",
      customerZipCode: "",
      customerCountry: "Deutschland",
      customerEmail: "",
      customerPhone: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: "" as unknown as number,
          taxRate: company.isSubjectToVAT ? (company.firstTaxRate ?? 19) : null,
        },
      ],
    });
  }, [company, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const createInvoice = useCreateInvoice(() => reset());

  const onSubmit = (data: Invoice) => {
    createInvoice.mutate(data);
  };

  const withVat = company?.isSubjectToVAT ?? false;
  const firstTaxRate = Number(company?.firstTaxRate ?? "0");
  const secondTaxRate = Number(company?.secondTaxRate ?? "0");

  const handleCustomerSelect = (customer: Invoice) => {
    setValue("customerName", customer.customerName);
    setValue("customerStreet", customer.customerStreet);
    setValue("customerHouseNumber", customer.customerHouseNumber);
    setValue("customerCity", customer.customerCity);
    setValue("customerZipCode", customer.customerZipCode);
    setValue("customerCountry", customer.customerCountry);
    setValue("customerEmail", customer.customerEmail);
    setValue("customerPhone", customer.customerPhone);
  };

  /* 
  When creating a new company, the user automatically becomes the organization admin, 
  but orgRole is not yet set by the hook during the first rendering,
  so orgRole is set to null and isOrgAdmin is set to false.
  In all other cases, the role is always present at the time of rendering.
  */
  const canEdit = !orgRole || isOrgAdmin; //TODO: probably a better way to do this

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="py-6" ref={invoiceFormRef} />
      <div className="space-y-4 dark:rounded-xl dark:bg-gray-950 dark:p-4 dark:text-white">
        {!canSendEmail && isOrgAdmin && !isMailStatusLoading && (
          <EmailSettingHint id={orgId} />
        )}
        <div className="flex flex-col justify-between gap-3 pt-3 sm:flex-row">
          <h2 className="order-last text-xl font-semibold sm:order-first">
            {t("newTitle")}
          </h2>
          <button
            type="button"
            className="underline hover:cursor-pointer hover:decoration-0"
            onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="flex">
              {canEdit ? t("editCompany") : t("viewCompany")}
              <ArrowUp className="ml-1" />
            </span>
          </button>
        </div>
        <h3 className="text-lg font-semibold">{t("customerInfo")}</h3>

        <div className="grid grid-cols-2 gap-3">
          <AutoCompleteInput
            bgWhite
            name="customerName"
            label={t("customerName")}
            className="col-span-2"
            register={register}
            errors={errors}
            fetchUrl={ROUTES.CUSTOMERS_SEARCH("customers")}
            setValue={setValue}
            onSelect={handleCustomerSelect}
            displayKey="customerName"
            control={control}
          />
          <Input
            bgWhite
            name="customerStreet"
            label={t("street")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input
            bgWhite
            name="customerHouseNumber"
            label={t("houseNumber")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input
            bgWhite
            name="customerZipCode"
            label={t("zip")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input
            bgWhite
            name="customerCity"
            label={t("city")}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
          />
          <Input
            bgWhite
            name="customerCountry"
            label={t("country")}
            className="col-span-2"
            register={register}
            errors={errors}
          />
          <Input
            bgWhite
            name="customerPhone"
            type="phone"
            label={t("phoneOptional")}
            className="col-span-2 sm:col-span-1"
            setValue={setValue}
            register={register}
            errors={errors}
          />
          <Input
            bgWhite
            name="customerEmail"
            label={`${t("emailOptional")}${canSendEmail ? "" : " (optional)"}`}
            className="col-span-2 sm:col-span-1"
            register={register}
            errors={errors}
            type="email"
          />
        </div>

        {/* Items */}
        <h3 className="text-lg font-semibold">{t("items")}</h3>
        {fields.map((field, idx) => (
          <div key={field.id} className="mb-2 grid grid-cols-12 gap-2">
            <AutoCompleteInput
              bgWhite
              name={`items.${idx}.description`}
              label={t("description")}
              className={`col-span-12 ${
                withVat ? "sm:col-span-5" : "sm:col-span-7"
              } mt-2 sm:mt-0`}
              register={register}
              errors={errors}
              fetchUrl={ROUTES.CUSTOMERS_SEARCH("products")}
              setValue={setValue}
              control={control}
              displayKey="description"
              onSelect={(product: Product) => {
                setValue(`items.${idx}.unitPrice`, product.unitPrice);
                if (withVat && product.taxRate != null) {
                  setValue(`items.${idx}.taxRate`, product.taxRate);
                }
              }}
            />
            <Input
              bgWhite
              className={`${
                withVat ? "col-span-3" : "col-span-4"
              } mt-2 sm:col-span-2 sm:mt-0`}
              name={`items.${idx}.quantity`}
              type="number"
              label={t("quantity")}
              register={register}
              errors={errors}
            />
            {withVat && (
              <SelectField
                name={`items.${idx}.taxRate`}
                label={t("taxRate")}
                options={[
                  { label: `${firstTaxRate}%`, value: firstTaxRate },
                  { label: `${secondTaxRate}%`, value: secondTaxRate },
                  { label: "0%", value: 0 },
                ]}
                register={register}
                errors={errors}
                setValueAs={(v) => (v === "" ? null : Number(v))}
                className="col-span-4 mt-2 sm:col-span-2 sm:mt-0"
                bgWhite
              />
            )}
            <Input
              bgWhite
              className={`${
                withVat ? "col-span-3" : "col-span-4"
              } mt-2 sm:col-span-2 sm:mt-0`}
              name={`items.${idx}.unitPrice`}
              inputMode="decimal"
              step="0.01"
              type="number"
              label={t("price")}
              register={register}
              errors={errors}
            />
            <div>
              <button
                ref={(el) => {
                  deleteButtonsRef.current[idx] = el;
                }}
                aria-label={t("removeItem")}
                type="button"
                className={`grid ${
                  withVat ? "col-span-3" : "col-span-4"
                } text-xxl mt-2 cursor-pointer rounded border bg-red-600 p-2 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:mt-0`}
                disabled={fields.length === 1}
                onClick={() => {
                  const willBeSingleItem = fields.length === 2;
                  const indexToFocus = idx > 0 ? idx - 1 : 0;

                  remove(idx);
                  setTimeout(() => {
                    if (willBeSingleItem) {
                      setFocus(`items.0.description`);
                    } else {
                      deleteButtonsRef.current[indexToFocus]?.focus();
                    }
                  }, 0);
                }}
              >
                <span className="block sm:hidden">
                  {withVat ? "✕" : t("delete")}
                </span>
                <span className="hidden sm:block">✕</span>
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          className="my-2 cursor-pointer rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800"
        >
          {t("addItem")}
        </button>

        <button
          type="submit"
          className="mt-4 block w-full cursor-pointer rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          disabled={createInvoice.isPending}
        >
          {createInvoice.isPending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
