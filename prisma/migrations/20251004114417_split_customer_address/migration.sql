/*
  Warnings:

  - You are about to drop the column `address` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `customerAddress` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `city` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `houseNumber` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerCity` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerHouseNumber` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerStreet` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerZipCode` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Deutschland',
ADD COLUMN     "houseNumber" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "customerAddress",
ADD COLUMN     "customerCity" TEXT NOT NULL,
ADD COLUMN     "customerCountry" TEXT NOT NULL DEFAULT 'Deutschland',
ADD COLUMN     "customerHouseNumber" TEXT NOT NULL,
ADD COLUMN     "customerStreet" TEXT NOT NULL,
ADD COLUMN     "customerZipCode" TEXT NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3);
