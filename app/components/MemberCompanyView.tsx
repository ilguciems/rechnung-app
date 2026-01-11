"use client";

import Image from "next/image";
import { useCompany } from "@/hooks";
import type { Company } from "@/lib/zod-schema";

const LABELS: Partial<Record<keyof Company, string>> = {
  name: "Firmenname",
  legalForm: "Gesellschaftsform",
  street: "Straße",
  houseNumber: "Hausnummer",
  zipCode: "PLZ",
  city: "Stadt",
  country: "Land",
  phone: "Telefon",
  email: "E-Mail",
  bank: "Bank",
  iban: "IBAN",
  bic: "BIC",
  ustId: "USt-IdNr.",
  steuernummer: "Steuernummer",
  handelsregisternummer: "Handelsregisternummer",
};

function maskIban(value: string) {
  return value.slice(0, 4) + " **** **** " + value.slice(-4);
}

function formatCompanyValue(key: keyof Company, value: Company[keyof Company]) {
  if (key === "iban") return maskIban(String(value));
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  return String(value);
}

export default function MemberCompanyView() {
  const { data: company } = useCompany();

  if (!company) return null;

  return (
    <section
      aria-labelledby="company-details-heading"
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      {company.logoUrl && (
        <Image
          src={company.logoUrl}
          width={180}
          height={100}
          alt="Firmenlogo"
          style={{ objectFit: "contain" }}
          quality={80}
          className="h-10 mb-4 p-0"
        />
      )}
      <div className="mb-4">
        <h2
          id="company-details-heading"
          className="text-lg font-semibold text-gray-900"
        >
          Unternehmensdaten
        </h2>
        <p className="text-sm text-gray-500">
          Diese Informationen können nur von Administratoren bearbeitet werden.
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {Object.entries(LABELS).map(([key, label]) => {
          const typedKey = key as keyof Company;
          const rawValue = company[typedKey];

          if (!rawValue) return null;

          const value = formatCompanyValue(typedKey, rawValue);

          return (
            <div key={key} className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
              </dt>
              <dd className="text-sm text-gray-900">{String(value)}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
