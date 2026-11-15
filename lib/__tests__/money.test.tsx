import type { Prisma } from "@/app/generated/prisma/client";
import {
  roundAmount,
  toAmount,
  toCompanyAmounts,
  toInvoiceAmounts,
  toRate,
} from "../money";

// Importing the Prisma runtime into jsdom hangs the worker, so the tests use a
// structural double that behaves like decimal.js: Number() goes through valueOf.
class DecimalLike {
  constructor(private readonly value: string) {}

  toString() {
    return this.value;
  }

  valueOf() {
    return this.value;
  }
}

const decimal = (value: string) =>
  new DecimalLike(value) as unknown as Prisma.Decimal;

describe("toAmount", () => {
  it("converts the Decimal Prisma returns for numeric columns", () => {
    expect(toAmount(decimal("19.99"))).toBe(19.99);
    expect(toAmount(decimal("0"))).toBe(0);
  });

  it("accepts plain numbers, strings and missing values", () => {
    expect(toAmount(12.5)).toBe(12.5);
    expect(toAmount("7.25")).toBe(7.25);
    expect(toAmount(null)).toBe(0);
    expect(toAmount(undefined)).toBe(0);
  });
});

describe("toRate", () => {
  it("keeps a missing rate empty instead of turning it into zero", () => {
    expect(toRate(null)).toBeNull();
    expect(toRate(undefined)).toBeNull();
  });

  it("converts a stored rate to a number", () => {
    expect(toRate(decimal("19.00"))).toBe(19);
  });
});

describe("roundAmount", () => {
  it("hides the drift of summing floats", () => {
    const sum = Array.from({ length: 10 }, () => 0.1).reduce(
      (a, b) => a + b,
      0,
    );

    expect(sum).not.toBe(1);
    expect(roundAmount(sum)).toBe(1);
  });

  it("rounds half a cent away from zero, for both signs", () => {
    expect(roundAmount(1.005)).toBe(1.01);
    expect(roundAmount(-1.005)).toBe(-1.01);
    expect(roundAmount(2.344)).toBe(2.34);
  });
});

describe("serializers", () => {
  it("turns invoice items into plain numbers for JSON responses", () => {
    const shaped = toInvoiceAmounts({
      id: "invoice-1",
      items: [
        {
          id: "item-1",
          description: "Beratung",
          quantity: 2,
          unitPrice: decimal("90.00"),
          taxRate: decimal("19.00"),
          invoiceId: "invoice-1",
        },
      ],
    } as unknown as Parameters<typeof toInvoiceAmounts>[0]);

    expect(shaped.items[0].unitPrice).toBe(90);
    expect(shaped.items[0].taxRate).toBe(19);
    expect(typeof JSON.parse(JSON.stringify(shaped)).items[0].unitPrice).toBe(
      "number",
    );
  });

  it("turns company tax rates into numbers or null", () => {
    const shaped = toCompanyAmounts({
      firstTaxRate: decimal("19.00"),
      secondTaxRate: null,
    } as Parameters<typeof toCompanyAmounts>[0]);

    expect(shaped.firstTaxRate).toBe(19);
    expect(shaped.secondTaxRate).toBeNull();
  });
});
