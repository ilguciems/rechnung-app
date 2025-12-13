-- CreateEnum
CREATE TYPE "public"."LegalForm" AS ENUM ('KLEINGEWERBE', 'FREIBERUFLER', 'GBR', 'EINZELKAUFMANN', 'OHG', 'KG', 'GMBH_CO_KG', 'GMBH', 'UG', 'AG', 'KGaA', 'SE', 'EWIV');

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Deutschland',
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isSubjectToVAT" BOOLEAN NOT NULL DEFAULT false,
    "firstTaxRate" DOUBLE PRECISION,
    "secondTaxRate" DOUBLE PRECISION,
    "legalForm" "public"."LegalForm" NOT NULL DEFAULT 'KLEINGEWERBE',
    "steuernummer" TEXT,
    "ustId" TEXT,
    "handelsregisternummer" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompanySnapshot" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isSubjectToVAT" BOOLEAN NOT NULL,
    "firstTaxRate" DOUBLE PRECISION,
    "secondTaxRate" DOUBLE PRECISION,
    "legalForm" "public"."LegalForm" NOT NULL,
    "steuernummer" TEXT,
    "ustId" TEXT,
    "handelsregisternummer" TEXT,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "CompanySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" SERIAL NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerNumber" TEXT,
    "customerStreet" TEXT NOT NULL,
    "customerHouseNumber" TEXT NOT NULL,
    "customerZipCode" TEXT NOT NULL,
    "customerCity" TEXT NOT NULL,
    "customerCountry" TEXT NOT NULL DEFAULT 'Deutschland',
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "companyId" INTEGER NOT NULL,
    "companySnapshotId" INTEGER,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION,
    "invoiceId" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "public"."Company"("createdAt");

-- CreateIndex
CREATE INDEX "Company_updatedAt_idx" ON "public"."Company"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "public"."Invoice"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "public"."CompanySnapshot" ADD CONSTRAINT "CompanySnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_companySnapshotId_fkey" FOREIGN KEY ("companySnapshotId") REFERENCES "public"."CompanySnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
