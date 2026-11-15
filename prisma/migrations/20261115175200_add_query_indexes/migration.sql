-- DropIndex
-- Single-column indexes no query can use: every read filters by a foreign key
-- (companyId / organizationId) or is covered by a composite index below.
DROP INDEX "company_createdAt_idx";
DROP INDEX "company_updatedAt_idx";
DROP INDEX "company_snapshot_createdAt_idx";
DROP INDEX "invoice_createdAt_idx";
DROP INDEX "activity_log_createdAt_idx";
DROP INDEX "activity_log_organizationId_idx";

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "organization_companyId_idx" ON "organization"("companyId");

-- CreateIndex
CREATE INDEX "organization_ownerId_idx" ON "organization"("ownerId");

-- CreateIndex
CREATE INDEX "organization_invite_organizationId_acceptedAt_idx" ON "organization_invite"("organizationId", "acceptedAt");

-- CreateIndex
CREATE INDEX "company_snapshot_companyId_createdAt_idx" ON "company_snapshot"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "invoice_companyId_createdAt_idx" ON "invoice"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "invoice_companyId_isPaid_createdAt_idx" ON "invoice"("companyId", "isPaid", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "invoice_createdByUserId_idx" ON "invoice"("createdByUserId");

-- CreateIndex
CREATE INDEX "item_invoiceId_idx" ON "item"("invoiceId");

-- CreateIndex
CREATE INDEX "activity_log_organizationId_createdAt_idx" ON "activity_log"("organizationId", "createdAt" DESC);
