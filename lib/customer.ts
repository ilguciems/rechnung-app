import { Prisma } from "@/app/generated/prisma/client";
import { type CustomerAddress, customerKey } from "@/lib/customer-key";
import { prisma } from "@/lib/prisma-client";

/**
 * Finds the customer for an address or creates it with the next customer
 * number of the company. The unique key on the address aborts one of two
 * concurrent inserts, so the loser retries and picks up the created row.
 */
export async function resolveCustomer(
  companyId: string,
  address: CustomerAddress,
) {
  const normalizedKey = customerKey(address);
  const where = { companyId_normalizedKey: { companyId, normalizedKey } };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const existing = await prisma.customer.findUnique({
      where,
      select: { id: true, customerNumber: true },
    });

    if (existing) return existing;

    try {
      return await prisma.$transaction(async (tx) => {
        const company = await tx.company.update({
          where: { id: companyId },
          data: { lastCustomerNumber: { increment: 1 } },
          select: { lastCustomerNumber: true },
        });

        return await tx.customer.create({
          data: {
            companyId,
            normalizedKey,
            customerNumber: `KND-${String(company.lastCustomerNumber).padStart(4, "0")}`,
            name: address.name.trim(),
            street: address.street.trim(),
            houseNumber: address.houseNumber.trim(),
            zipCode: address.zipCode.trim(),
            city: address.city.trim(),
            country: address.country.trim(),
            email: address.email?.trim() || null,
            phone: address.phone?.trim() || null,
          },
          select: { id: true, customerNumber: true },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Could not resolve the customer for this address");
}
