-- AlterTable
ALTER TABLE "company" ADD COLUMN "lastCustomerNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN "customerId" TEXT;

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Deutschland',
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_companyId_name_idx" ON "customer"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_companyId_customerNumber_key" ON "customer"("companyId", "customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "customer_companyId_normalizedKey_key" ON "customer"("companyId", "normalizedKey");

-- CreateIndex
CREATE INDEX "invoice_customerId_idx" ON "invoice"("customerId");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: build the customer master data from the addresses that are
-- denormalized on invoice. The grouping key must stay byte-identical to
-- lib/customer-key.ts (customerKey): trim, collapse whitespace, lowercase,
-- join the eight address fields with "|" and hash with md5.

CREATE TEMP TABLE "_invoice_customer" AS
SELECT
  src.invoice_id,
  src.company_id,
  src.grp_key,
  src.old_number,
  src.created_at,
  'c' || substr(md5(src.company_id || src.grp_key), 1, 24) AS customer_id
FROM (
  SELECT
    i.id AS invoice_id,
    i."companyId" AS company_id,
    i."customerNumber" AS old_number,
    i."createdAt" AS created_at,
    md5(concat_ws('|',
      lower(regexp_replace(btrim(i."customerName"), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(i."customerStreet"), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(i."customerHouseNumber"), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(i."customerZipCode"), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(i."customerCity"), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(i."customerCountry"), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(coalesce(i."customerEmail", '')), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(coalesce(i."customerPhone", '')), '\s+', ' ', 'g'))
    )) AS grp_key
  FROM "invoice" i
) src;

-- One customer per address, taking the address of the most recent invoice.
-- Numbers start as unique placeholders and are replaced below.
WITH latest AS (
  SELECT DISTINCT ON (g.company_id, g.grp_key)
    g.customer_id,
    g.company_id,
    g.grp_key,
    i."customerName",
    i."customerStreet",
    i."customerHouseNumber",
    i."customerZipCode",
    i."customerCity",
    i."customerCountry",
    i."customerEmail",
    i."customerPhone"
  FROM "_invoice_customer" g
  JOIN "invoice" i ON i.id = g.invoice_id
  ORDER BY g.company_id, g.grp_key, i."createdAt" DESC, i.id DESC
),
first_seen AS (
  SELECT company_id, grp_key, min(created_at) AS seen_at
  FROM "_invoice_customer"
  GROUP BY company_id, grp_key
)
INSERT INTO "customer" (
  "id", "createdAt", "updatedAt", "companyId", "customerNumber", "normalizedKey",
  "name", "street", "houseNumber", "zipCode", "city", "country", "email", "phone"
)
SELECT
  l.customer_id,
  f.seen_at,
  now(),
  l.company_id,
  'TMP-' || l.grp_key,
  l.grp_key,
  btrim(l."customerName"),
  btrim(l."customerStreet"),
  btrim(l."customerHouseNumber"),
  btrim(l."customerZipCode"),
  btrim(l."customerCity"),
  btrim(l."customerCountry"),
  btrim(l."customerEmail"),
  btrim(l."customerPhone")
FROM latest l
JOIN first_seen f ON f.company_id = l.company_id AND f.grp_key = l.grp_key;

-- Give customers back the number their invoices already carry. A number used
-- by more than one address stays with the address that appeared first.
WITH candidates AS (
  SELECT
    company_id,
    customer_id,
    min(created_at) AS seen_at,
    min(old_number) FILTER (WHERE old_number IS NOT NULL) AS old_number
  FROM "_invoice_customer"
  GROUP BY company_id, customer_id
),
kept AS (
  SELECT DISTINCT ON (company_id, old_number) customer_id, old_number
  FROM candidates
  WHERE old_number IS NOT NULL
  ORDER BY company_id, old_number, seen_at
)
UPDATE "customer" c
SET "customerNumber" = k.old_number
FROM kept k
WHERE c.id = k.customer_id;

-- Number the remaining customers after the highest number ever used, oldest
-- address first, so the result is deterministic.
WITH max_invoice AS (
  SELECT
    "companyId" AS company_id,
    coalesce(max(NULLIF(regexp_replace("customerNumber", '\D', '', 'g'), '')::bigint), 0) AS n
  FROM "invoice"
  GROUP BY 1
),
max_customer AS (
  SELECT
    "companyId" AS company_id,
    coalesce(
      max(NULLIF(regexp_replace("customerNumber", '\D', '', 'g'), '')::bigint)
        FILTER (WHERE "customerNumber" NOT LIKE 'TMP-%'),
      0
    ) AS n
  FROM "customer"
  GROUP BY 1
),
pending AS (
  SELECT
    c.id,
    c."companyId",
    row_number() OVER (PARTITION BY c."companyId" ORDER BY c."createdAt", c.id) AS rn
  FROM "customer" c
  WHERE c."customerNumber" LIKE 'TMP-%'
)
UPDATE "customer" c
SET "customerNumber" = 'KND-' || lpad((greatest(mi.n, mc.n) + p.rn)::text, 4, '0')
FROM pending p
JOIN max_invoice mi ON mi.company_id = p."companyId"
JOIN max_customer mc ON mc.company_id = p."companyId"
WHERE c.id = p.id;

-- Link the existing invoices to their customer.
UPDATE "invoice" i
SET "customerId" = g.customer_id
FROM "_invoice_customer" g
WHERE i.id = g.invoice_id;

-- Keep the company counter in sync with the numbers handed out above.
UPDATE "company" co
SET "lastCustomerNumber" = agg.n
FROM (
  SELECT
    "companyId" AS company_id,
    max(coalesce(NULLIF(regexp_replace("customerNumber", '\D', '', 'g'), '')::bigint, 0)) AS n
  FROM "customer"
  GROUP BY 1
) agg
WHERE co.id = agg.company_id;

DROP TABLE "_invoice_customer";
