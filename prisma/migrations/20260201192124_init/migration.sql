-- CreateEnum
CREATE TYPE "LegalForm" AS ENUM ('KLEINGEWERBE', 'FREIBERUFLER', 'GBR', 'EINZELKAUFMANN', 'OHG', 'KG', 'GMBH_CO_KG', 'GMBH', 'UG', 'AG', 'KGaA', 'SE', 'EWIV');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'DOWNLOAD', 'SEND');

-- CreateEnum
CREATE TYPE "ActivityEntity" AS ENUM ('INVOICE', 'COMPANY', 'CUSTOMER', 'USER', 'EMAIL');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('EMAIL', 'POST');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,

    CONSTRAINT "organization_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mailjet_config" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "publicKeyEnc" TEXT NOT NULL,
    "privateKeyEnc" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mailjet_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_invite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "organization_invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
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
    "legalForm" "LegalForm" NOT NULL DEFAULT 'KLEINGEWERBE',
    "steuernummer" TEXT,
    "ustId" TEXT,
    "handelsregisternummer" TEXT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_snapshot" (
    "id" TEXT NOT NULL,
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
    "legalForm" "LegalForm" NOT NULL,
    "steuernummer" TEXT,
    "ustId" TEXT,
    "handelsregisternummer" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
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
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "companySnapshotId" TEXT,
    "lastSentAt" TIMESTAMP(3),
    "lastReminderLevel" INTEGER DEFAULT 0,
    "invoiceSentAt" TIMESTAMP(3),
    "firstReminderSentAt" TIMESTAMP(3),
    "secondReminderSentAt" TIMESTAMP(3),
    "thirdReminderSentAt" TIMESTAMP(3),
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'EMAIL',

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "organizationId" TEXT,
    "companyId" TEXT,
    "action" "ActivityAction" NOT NULL,
    "entityType" "ActivityEntity" NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "organization_member_organizationId_idx" ON "organization_member"("organizationId");

-- CreateIndex
CREATE INDEX "organization_member_userId_idx" ON "organization_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_member_userId_organizationId_key" ON "organization_member"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "mailjet_config_organizationId_key" ON "mailjet_config"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invite_token_key" ON "organization_invite"("token");

-- CreateIndex
CREATE INDEX "company_createdAt_idx" ON "company"("createdAt");

-- CreateIndex
CREATE INDEX "company_updatedAt_idx" ON "company"("updatedAt");

-- CreateIndex
CREATE INDEX "company_snapshot_createdAt_idx" ON "company_snapshot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_createdAt_idx" ON "invoice"("createdAt");

-- CreateIndex
CREATE INDEX "activity_log_createdAt_idx" ON "activity_log"("createdAt");

-- CreateIndex
CREATE INDEX "activity_log_userId_idx" ON "activity_log"("userId");

-- CreateIndex
CREATE INDEX "activity_log_organizationId_idx" ON "activity_log"("organizationId");

-- CreateIndex
CREATE INDEX "activity_log_companyId_idx" ON "activity_log"("companyId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailjet_config" ADD CONSTRAINT "mailjet_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invite" ADD CONSTRAINT "organization_invite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_snapshot" ADD CONSTRAINT "company_snapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_companySnapshotId_fkey" FOREIGN KEY ("companySnapshotId") REFERENCES "company_snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
