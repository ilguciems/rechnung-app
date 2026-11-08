import type { z } from "zod";
import { companySchema, invoiceItemSchema, invoiceSchema } from "../zod-schema";

// A valid base so each case only reports the field under test.
const validCompany = {
  name: "Test GmbH",
  street: "Hauptstrasse",
  city: "Berlin",
  zipCode: "10115",
  houseNumber: "1",
  country: "Deutschland",
  phone: "+4915112345678",
  email: "a@b.de",
  isSubjectToVAT: false,
  legalForm: "KLEINGEWERBE" as const,
  iban: "DE89370400440532013000",
  bic: "DEUTDEFFXXX",
  bank: "Deutsche Bank",
};

const messageFor = (result: z.ZodSafeParseResult<unknown>, field: string) =>
  result.error?.issues.find((issue) => issue.path[0] === field)?.message;

describe("zod schemas keep their custom messages", () => {
  it("reports the tax rate message when the value is not a number", () => {
    expect(
      messageFor(
        companySchema.safeParse({ ...validCompany, firstTaxRate: "abc" }),
        "firstTaxRate",
      ),
    ).toBe("Steuersatz erforderlich");

    expect(
      messageFor(
        companySchema.safeParse({ ...validCompany, secondTaxRate: "abc" }),
        "secondTaxRate",
      ),
    ).toBe("Steuersatz erforderlich");
  });

  it("reports the bank message when the value is not a string", () => {
    expect(
      messageFor(
        companySchema.safeParse({ ...validCompany, bank: 123 }),
        "bank",
      ),
    ).toBe("Bank ist erforderlich");
  });

  it("reports the item messages when the numbers are missing", () => {
    expect(
      messageFor(
        invoiceItemSchema.safeParse({
          description: "Arbeit",
          quantity: "x",
          unitPrice: 5,
        }),
        "quantity",
      ),
    ).toBe("Menge erforderlich");

    expect(
      messageFor(
        invoiceItemSchema.safeParse({
          description: "Arbeit",
          quantity: 1,
          unitPrice: "x",
        }),
        "unitPrice",
      ),
    ).toBe("Preis erforderlich");
  });

  // The API parses the wrapper schema, so the nested messages must survive it.
  it("keeps the item messages through the schema the API validates with", () => {
    const result = invoiceSchema.safeParse({
      customerName: "Test Kunde",
      customerStreet: "Teststr",
      customerHouseNumber: "1",
      customerCity: "Berlin",
      customerZipCode: "10115",
      customerCountry: "Deutschland",
      items: [
        { description: "Arbeit", quantity: "kaputt", unitPrice: "auch kaputt" },
      ],
    });

    expect(
      result.error?.issues.map((issue) => [
        issue.path.join("."),
        issue.message,
      ]),
    ).toEqual([
      ["items.0.quantity", "Menge erforderlich"],
      ["items.0.unitPrice", "Preis erforderlich"],
    ]);
  });
});
