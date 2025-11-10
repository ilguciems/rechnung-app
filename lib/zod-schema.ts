import { z } from "zod";

import {
  bicRegex,
  genericIbanRegex,
  germanIbanRegex,
  getCountryCode,
  isValidIbanChecksum,
} from "@/lib/iban-utils";

import { normalizePhone } from "@/lib/phone-utils";

export const LegalFormEnum = z.enum([
  "KLEINGEWERBE",
  "FREIBERUFLER",
  "GBR",
  "EINZELKAUFMANN",
  "OHG",
  "KG",
  "GMBH_CO_KG",
  "GMBH",
  "UG",
  "AG",
  "KGaA",
  "SE",
  "EWIV",
]);

export const VAT_REQUIRED_FORMS = [
  "GMBH",
  "UG",
  "AG",
  "OHG",
  "KG",
  "GMBH_CO_KG",
  "KGaA",
  "SE",
  "EWIV",
];

export const HANDELSREGISTER_REQUIRED_FORMS = [
  "GMBH",
  "UG",
  "AG",
  "OHG",
  "KG",
  "GMBH_CO_KG",
  "KGaA",
  "SE",
  "EWIV",
  "EINZELKAUFMANN",
];

export const companySchema = z
  .object({
    name: z.string().min(2, "Name ist erforderlich"),
    street: z.string().min(2, "Straße ist erforderlich"),
    city: z.string().min(2, "Stadt ist erforderlich"),
    zipCode: z.string().min(2, "PLZ ist erforderlich"),
    houseNumber: z.string().min(1, "Hausnummer ist erforderlich"),
    country: z.string().min(2, "Land ist erforderlich"),
    phone: z
      .string()
      .min(6, "Telefon ist erforderlich")
      .transform((val) => normalizePhone(val))
      .refine(
        (val) => /^\+\d{8,15}$/.test(val as string),
        "Bitte geben Sie eine gültige Telefonnummer im internationalen Format ein",
      ),
    email: z.email("Ungültige E-Mail"),
    isSubjectToVAT: z.boolean(),
    firstTaxRate: z
      .number("Steuersatz erforderlich")
      .default(19)
      .optional()
      .nullable(),
    secondTaxRate: z
      .number("Steuersatz erforderlich")
      .default(7)
      .optional()
      .nullable(),
    logoUrl: z.string().optional().nullable(),
    legalForm: LegalFormEnum,

    steuernummer: z.string().optional().nullable(),
    ustId: z.string().optional().nullable(),
    handelsregisternummer: z.string().optional().nullable(),

    iban: z
      .string("IBAN ist erforderlich")
      .transform((v) => v?.replace(/\s+/g, "").toUpperCase() ?? null)
      .refine(
        (v) => {
          if (!v) return true;
          if (!genericIbanRegex.test(v)) return false;
          if (v.startsWith("DE") && !germanIbanRegex.test(v)) return false;
          return isValidIbanChecksum(v);
        },
        { message: "Ungültige IBAN" },
      )
      .transform((v) => {
        if (!v) return v;
        return v.replace(/(.{4})/g, "$1 ").trim();
      }),
    bic: z
      .string("BIC ist erforderlich")
      .trim()
      .transform((v) => v?.toUpperCase() ?? null)
      .refine((v) => !v || bicRegex.test(v), {
        message: "Ungültiges BIC-Format",
      }),

    bank: z.string("Bank ist erforderlich").min(2, "Bank ist erforderlich"),
  })
  .superRefine((data, ctx) => {
    const { iban, bic, country } = data;
    const countryCode = getCountryCode(country);

    if (!countryCode) return;

    // --- IBAN ---
    if (iban) {
      if (!iban.startsWith(countryCode)) {
        ctx.addIssue({
          path: ["iban"],
          message: `IBAN sollte mit "${countryCode}" beginnen`,
          code: "custom",
        });
      }
    }

    // --- BIC ---
    if (bic && !bic.includes(countryCode)) {
      ctx.addIssue({
        path: ["bic"],
        message: `BIC sollte den Ländercode "${countryCode}" enthalten`,
        code: "custom",
      });
    }

    // --- Steuernummer / USt-IdNr ---
    if (!data.steuernummer && !data.ustId) {
      ctx.addIssue({
        code: "custom",
        message:
          "Bitte geben Sie entweder die Steuernummer oder die USt-IdNr. an.",
        path: ["steuernummer"],
      });
    }

    // --- Handelsregisternummer ---
    if (
      VAT_REQUIRED_FORMS.includes(data.legalForm) &&
      !data.handelsregisternummer
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Handelsregisternummer ist für diese Rechtsform erforderlich.",
        path: ["handelsregisternummer"],
      });
    }

    // --- Handelsregisternummer ---
    const requiresHandelsregister = HANDELSREGISTER_REQUIRED_FORMS.includes(
      data.legalForm,
    );

    if (requiresHandelsregister && !data.handelsregisternummer?.trim()) {
      ctx.addIssue({
        path: ["handelsregisternummer"],
        message: "Handelsregisternummer ist für diese Rechtsform erforderlich.",
        code: "custom",
      });
    }
  });

export type Company = z.infer<typeof companySchema>;

export const invoiceItemSchema = z.object({
  description: z.string().min(2, "Beschreibung erforderlich"),
  quantity: z
    .number("Menge erforderlich")
    .min(1, "Menge muss mindestens 1 sein"),
  unitPrice: z
    .number("Preis erforderlich")
    .min(0.01, "Preis muss positiv sein"),
  taxRate: z.number().min(0).max(100).default(19).optional().nullable(),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  customerName: z.string().min(2, "Name ist erforderlich"),
  customerStreet: z.string().min(2, "Straße ist erforderlich"),
  customerHouseNumber: z.string().min(1, "Hausnummer ist erforderlich"),
  customerCity: z.string().min(2, "Stadt ist erforderlich"),
  customerZipCode: z.string().min(2, "PLZ ist erforderlich"),
  customerCountry: z.string().min(2, "Land ist erforderlich"),
  items: z
    .array(invoiceItemSchema)
    .min(1, "Mindestens eine Position erforderlich"),
});

export type Invoice = z.infer<typeof invoiceSchema>;

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/png"];

export const uploadSchema = z.object({
  file: z
    .any()
    // To not allow empty files
    .refine((files) => files?.length >= 1, {
      message: "Datei ist erforderlich",
    })
    // To not allow files other than images
    .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), {
      message: "nur PNG-Dateien sind erlaubt.",
    })
    // To not allow files larger than 5MB
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, {
      message: "Datei darf nicht mehr als 5MB groß sein.",
    }),
});

export type UploadData = z.infer<typeof uploadSchema>;
