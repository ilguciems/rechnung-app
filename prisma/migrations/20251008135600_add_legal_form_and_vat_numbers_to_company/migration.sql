/*
  Warnings:

  - Added the required column `updatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LegalForm" AS ENUM ('KLEINGEWERBE', 'FREIBERUFLER', 'GBR', 'EINZELKAUFMANN', 'OHG', 'KG', 'GMBH_CO_KG', 'GMBH', 'UG', 'AG', 'KGaA', 'SE', 'EWIV');

-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "handelsregisternummer" TEXT,
ADD COLUMN     "legalForm" "public"."LegalForm" NOT NULL DEFAULT 'KLEINGEWERBE',
ADD COLUMN     "steuernummer" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ustId" TEXT;

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "public"."Company"("createdAt");

-- CreateIndex
CREATE INDEX "Company_updatedAt_idx" ON "public"."Company"("updatedAt");
