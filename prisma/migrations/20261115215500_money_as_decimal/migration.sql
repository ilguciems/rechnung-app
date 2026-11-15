-- Money and tax rates move from floating point to exact decimals: 19.99 is
-- stored as 19.99, and sums no longer drift by fractions of a cent.
-- Both casts round to the new scale.

-- AlterTable
ALTER TABLE "company" ALTER COLUMN "firstTaxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "secondTaxRate" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "company_snapshot" ALTER COLUMN "firstTaxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "secondTaxRate" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "item" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2);
