/*
  Warnings:

  - Made the column `phone` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `iban` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bic` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bank` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Company" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "iban" SET NOT NULL,
ALTER COLUMN "bic" SET NOT NULL,
ALTER COLUMN "bank" SET NOT NULL,
ALTER COLUMN "firstTaxRate" DROP DEFAULT,
ALTER COLUMN "secondTaxRate" DROP DEFAULT;
