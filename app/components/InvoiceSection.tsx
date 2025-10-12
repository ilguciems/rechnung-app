"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { type Invoice, invoiceSchema } from "@/lib/zod-schema";
import Input from "./Input";
import { SelectField } from "./SelectField";

export default function InvoiceSection() {
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const res = await fetch("/api/company");
      if (!res.ok) throw new Error("Fehler beim Laden der Firma");
      return res.json();
    },
  });

  const invoiceFormRef = useRef<HTMLDivElement | null>(null);

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
  } = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      customerStreet: "",
      customerHouseNumber: "",
      customerCity: "",
      customerZipCode: "",
      customerCountry: "Deutschland",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: "" as unknown as number,
          taxRate: company.isSubjectToVAT ? (company.firstTaxRate ?? 19) : null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const createInvoice = useMutation({
    mutationFn: async (newInvoice: Invoice) => {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
      if (!res.ok) throw new Error("Fehler beim Erstellen");
      return res.json();
    },
    onError: () => toast.error("Fehler beim Erstellen"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Rechnung erstellt!");
      reset();
    },
  });

  const onSubmit = (data: Invoice) => {
    createInvoice.mutate(data);
  };

  const withVat = company.isSubjectToVAT;
  const firstTaxRate = parseFloat(company.firstTaxRate);
  const secondTaxRate = parseFloat(company.secondTaxRate);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold" ref={invoiceFormRef}>
        Neue Rechnung
      </h2>
      <h3 className="text-lg font-semibold">Kundeninformationen</h3>

      <div className="grid grid-cols-2 gap-3">
        <Input
          bgWhite
          name="customerName"
          label="Kundenname / Firmenname"
          className="col-span-2"
          register={register}
          errors={errors}
        />
        <Input
          bgWhite
          name="customerStreet"
          label="Strasse"
          className="col-span-2 sm:col-span-1"
          register={register}
          errors={errors}
        />
        <Input
          bgWhite
          name="customerHouseNumber"
          label="Hausnummer"
          className="col-span-2 sm:col-span-1"
          register={register}
          errors={errors}
        />
        <Input
          bgWhite
          name="customerZipCode"
          label="PLZ"
          className="col-span-2 sm:col-span-1"
          register={register}
          errors={errors}
        />
        <Input
          bgWhite
          name="customerCity"
          label="Ort"
          className="col-span-2 sm:col-span-1"
          register={register}
          errors={errors}
        />
        <Input
          bgWhite
          name="customerCountry"
          label="Land"
          className="col-span-2"
          register={register}
          errors={errors}
        />
      </div>

      {/* Items */}
      <h3 className="text-lg font-semibold">Positionen</h3>
      {fields.map((field, idx) => (
        <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
          <Input
            bgWhite
            className={`col-span-12 ${
              withVat ? "sm:col-span-5" : "sm:col-span-7"
            } mt-2 sm:mt-0`}
            name={`items.${idx}.description`}
            label="Warenbeschreibung"
            register={register}
            errors={errors}
          />
          <Input
            bgWhite
            className={`${
              withVat ? "col-span-3" : "col-span-4"
            } sm:col-span-2 mt-2 sm:mt-0`}
            name={`items.${idx}.quantity`}
            type="number"
            label="Menge"
            register={register}
            errors={errors}
          />
          {withVat && (
            <SelectField
              name={`items.${idx}.taxRate`}
              label="Steuersatz"
              options={[
                { label: `${firstTaxRate}%`, value: firstTaxRate },
                { label: `${secondTaxRate}%`, value: secondTaxRate },
                { label: "0%", value: 0 },
              ]}
              register={register}
              errors={errors}
              setValueAs={(v) => (v === "" ? null : Number(v))}
              className="col-span-4 sm:col-span-2 mt-2 sm:mt-0"
              bgWhite
            />
          )}
          <Input
            bgWhite
            className={`${
              withVat ? "col-span-3" : "col-span-4"
            } sm:col-span-2 mt-2 sm:mt-0`}
            name={`items.${idx}.unitPrice`}
            inputMode="decimal"
            step="0.01"
            type="number"
            label="Preis"
            register={register}
            errors={errors}
          />
          <div>
            <button
              aria-label="Artikel entfernen"
              type="button"
              className={`grid ${
                withVat ? "col-span-3" : "col-span-4"
              } sm:col-span-1 mt-2 sm:mt-0 text-white bg-red-600 font-bold text-xxl hover:bg-red-700 cursor-pointer border p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={fields.length === 1}
              onClick={() => remove(idx)}
            >
              <span className="block sm:hidden">
                {withVat ? "✕" : "Löschen"}
              </span>
              <span className="hidden sm:block">✕</span>
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
        className="bg-gray-200 px-3 py-1 rounded my-2 hover:bg-gray-300 cursor-pointer"
      >
        + Artikel hinzufügen
      </button>

      <button
        type="submit"
        className="block w-full bg-blue-600 text-white py-2 rounded mt-4 cursor-pointer hover:bg-blue-700"
        disabled={createInvoice.isPending}
      >
        {createInvoice.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Speichern...
          </>
        ) : (
          "Speichern"
        )}
      </button>
    </form>
  );
}
