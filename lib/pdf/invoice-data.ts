import { type CompanySnapshotRow, toAmount, toRate } from "@/lib/money";
import type { Company } from "@/lib/zod-schema";
import type { CreatedInvoice, InvoiceRow } from "./pdf";

/** Turns a database invoice into the plain-number shape the PDF renderer uses. */
export const toPdfInvoice = (invoice: InvoiceRow): CreatedInvoice => ({
  ...invoice,
  items: invoice.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: toAmount(item.unitPrice),
    taxRate: toRate(item.taxRate),
  })),
});

export const toPdfCompany = (company: CompanySnapshotRow): Company => ({
  ...company,
  firstTaxRate: toRate(company.firstTaxRate),
  secondTaxRate: toRate(company.secondTaxRate),
});
