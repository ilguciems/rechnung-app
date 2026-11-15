import { type CustomerAddress, customerKey } from "../customer-key";

const base: CustomerAddress = {
  name: "Max Mustermann",
  street: "Hauptstr.",
  houseNumber: "5",
  zipCode: "12345",
  city: "Koeln",
  country: "Deutschland",
  email: null,
  phone: null,
};

describe("customerKey", () => {
  // The expected values were produced by the SQL in
  // prisma/migrations/20261115193000_add_customer_table; a mismatch means the
  // backfill and the runtime would no longer identify the same customers.
  it("matches the hash the backfill migration computes in SQL", () => {
    expect(customerKey(base)).toBe("97e0e60fb517522c18c6e8f32f8c4f3f");
  });

  it("ignores case and surrounding or repeated whitespace", () => {
    expect(
      customerKey({
        ...base,
        name: "  max   MUSTERMANN ",
        street: "hauptstr.",
        city: "koeln",
        country: "deutschland",
      }),
    ).toBe(customerKey(base));
  });

  it("treats missing contact details and empty strings the same", () => {
    expect(customerKey({ ...base, email: "", phone: undefined })).toBe(
      customerKey(base),
    );
  });

  it("separates customers that differ in contact details", () => {
    const withContact = {
      ...base,
      email: "max@example.com",
      phone: "+491701234567",
    };

    expect(customerKey(withContact)).toBe("1ee761665e3768912c383f316332ebea");
    expect(customerKey(withContact)).not.toBe(customerKey(base));
  });
});
