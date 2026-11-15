import type { Prisma } from "@/app/generated/prisma/client";

type Numeric = Prisma.Decimal | number | string | null | undefined;

export type InvoiceWithItems = Prisma.InvoiceGetPayload<{
  include: { items: true };
}>;

export type CompanyRow = Prisma.CompanyGetPayload<Record<string, never>>;

export type CompanySnapshotRow = Prisma.CompanySnapshotGetPayload<
  Record<string, never>
>;

/**
 * Money and tax rates are `numeric` columns, so Prisma hands them out as
 * `Decimal`. Forms, charts and the PDF renderer work with plain numbers, so
 * conversions happen where the data leaves the database.
 */
export const toAmount = (value: Numeric): number => Number(value ?? 0);

export const toRate = (value: Numeric): number | null =>
  value === null || value === undefined ? null : Number(value);

/** Rounds to cents, away from zero, without the usual float drift. */
export const roundAmount = (value: number): number => {
  const rounded = Math.round((Math.abs(value) + Number.EPSILON) * 100) / 100;

  return value < 0 ? -rounded : rounded;
};

export const toInvoiceAmounts = <T extends InvoiceWithItems>(invoice: T) => ({
  ...invoice,
  items: invoice.items.map((item) => ({
    ...item,
    unitPrice: toAmount(item.unitPrice),
    taxRate: toRate(item.taxRate),
  })),
});

export const toCompanyAmounts = (company: CompanyRow) => ({
  ...company,
  firstTaxRate: toRate(company.firstTaxRate),
  secondTaxRate: toRate(company.secondTaxRate),
});
