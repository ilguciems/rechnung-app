/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber,companyId]` on the table `invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "invoice_invoiceNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_companyId_key" ON "invoice"("invoiceNumber", "companyId");
