import { createHash } from "node:crypto";

export type CustomerAddress = {
  name: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
  email?: string | null;
  phone?: string | null;
};

const normalize = (value: string | null | undefined) =>
  (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Identity of a customer inside a company. The backfill in
 * prisma/migrations/20261115193000_add_customer_table computes the same hash
 * in SQL (md5 over the normalized fields joined with "|"), so both
 * implementations have to stay in sync.
 */
export function customerKey(address: CustomerAddress): string {
  return createHash("md5")
    .update(
      [
        address.name,
        address.street,
        address.houseNumber,
        address.zipCode,
        address.city,
        address.country,
        address.email,
        address.phone,
      ]
        .map(normalize)
        .join("|"),
    )
    .digest("hex");
}
