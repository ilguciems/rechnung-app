-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "firstTaxRate" INTEGER DEFAULT 19,
ADD COLUMN     "isSubjectToVAT" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "secondTaxRate" INTEGER DEFAULT 7;
