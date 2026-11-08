import path from "node:path";
import { deleteLogoFile } from "./logo-url";

type InvoiceCounter = {
  invoice: {
    count: (args: {
      where: { companySnapshot: { logoUrl: string } };
    }) => Promise<number>;
  };
};

/**
 * Invoice PDFs, reminder mails and resends render the company data stored on the
 * invoice's snapshot. A superseded logo file therefore has to stay on disk while
 * any invoice can still print it; only a logo no invoice references is removed.
 * Snapshots nobody invoiced do not keep the file alive.
 *
 * Returns true when a file was deleted.
 */
export async function deleteSupersededLogo(
  db: InvoiceCounter,
  previousLogoUrl: string | null,
  currentLogoUrl: string,
  publicDir: string = path.join(process.cwd(), "public"),
): Promise<boolean> {
  if (!previousLogoUrl || previousLogoUrl === currentLogoUrl) {
    return false;
  }

  const invoicesUsingLogo = await db.invoice.count({
    where: {
      companySnapshot: {
        logoUrl: previousLogoUrl,
      },
    },
  });

  if (invoicesUsingLogo > 0) {
    return false;
  }

  return deleteLogoFile(previousLogoUrl, publicDir);
}
