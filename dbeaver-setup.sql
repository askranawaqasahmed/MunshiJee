-- ================================================================
-- MunshiJee - Complete Database Setup Script for DBeaver
-- ================================================================
-- This script creates the entire database schema and seeds initial data
-- Run this in DBeaver after creating an empty database
-- ================================================================

-- ================================================================
-- PART 1: CREATE ENUMS
-- ================================================================

-- Drop existing types if they exist (for clean re-runs)
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "InvoiceType" CASCADE;
DROP TYPE IF EXISTS "InvoiceStatus" CASCADE;
DROP TYPE IF EXISTS "RecurringFrequency" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "NotificationStatus" CASCADE;
DROP TYPE IF EXISTS "SubscriptionPlanType" CASCADE;
DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;

-- Create Enums
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'USER');
CREATE TYPE "InvoiceType" AS ENUM ('ONE_TIME', 'RECURRING', 'BULK');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "RecurringFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE', 'OTHER');
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TYPE "SubscriptionPlanType" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- ================================================================
-- PART 2: CREATE TABLES
-- ================================================================

-- Drop existing tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS "UserSubscription" CASCADE;
DROP TABLE IF EXISTS "SubscriptionPlan" CASCADE;
DROP TABLE IF EXISTS "NotificationLog" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Sale" CASCADE;
DROP TABLE IF EXISTS "InvoiceItem" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- User Table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Customer Table
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contactAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Invoice Table
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFrequency" "RecurringFrequency",
    "nextBillingDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- InvoiceItem Table
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- Sale Table
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- Payment Table
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Settings Table
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- NotificationLog Table
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- SubscriptionPlan Table
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" "SubscriptionPlanType" NOT NULL,
    "emailLimit" INTEGER NOT NULL,
    "smsLimit" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- UserSubscription Table
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "emailsUsed" INTEGER NOT NULL DEFAULT 0,
    "smsUsed" INTEGER NOT NULL DEFAULT 0,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- ================================================================
-- PART 3: CREATE INDEXES
-- ================================================================

-- User Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- Customer Indexes
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");
CREATE INDEX "Customer_isActive_idx" ON "Customer"("isActive");
CREATE UNIQUE INDEX "Customer_userId_email_key" ON "Customer"("userId", "email");

-- Invoice Indexes
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "Invoice_nextBillingDate_idx" ON "Invoice"("nextBillingDate");

-- InvoiceItem Indexes
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- Sale Indexes
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
CREATE INDEX "Sale_invoiced_idx" ON "Sale"("invoiced");
CREATE INDEX "Sale_saleDate_idx" ON "Sale"("saleDate");

-- Payment Indexes
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- Settings Indexes
CREATE INDEX "Settings_userId_idx" ON "Settings"("userId");
CREATE INDEX "Settings_key_idx" ON "Settings"("key");
CREATE UNIQUE INDEX "Settings_key_userId_key" ON "Settings"("key", "userId");

-- NotificationLog Indexes
CREATE INDEX "NotificationLog_invoiceId_idx" ON "NotificationLog"("invoiceId");
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- SubscriptionPlan Indexes
CREATE UNIQUE INDEX "SubscriptionPlan_slug_key" ON "SubscriptionPlan"("slug");
CREATE INDEX "SubscriptionPlan_slug_idx" ON "SubscriptionPlan"("slug");

-- UserSubscription Indexes
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");
CREATE INDEX "UserSubscription_planId_idx" ON "UserSubscription"("planId");
CREATE INDEX "UserSubscription_status_idx" ON "UserSubscription"("status");
CREATE INDEX "UserSubscription_endDate_idx" ON "UserSubscription"("endDate");

-- ================================================================
-- PART 4: CREATE FOREIGN KEYS
-- ================================================================

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_fkey" 
    FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ================================================================
-- PART 5: SEED DATA - SUBSCRIPTION PLANS
-- ================================================================

-- Insert Free Plan
INSERT INTO "SubscriptionPlan" ("id", "name", "slug", "emailLimit", "smsLimit", "price", "description", "isFree", "createdAt", "updatedAt")
VALUES (
    'plan_free_000001',
    'Free',
    'FREE',
    10,
    0,
    0.00,
    'Free plan with 10 email notifications per month. Perfect for getting started.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Starter Plan
INSERT INTO "SubscriptionPlan" ("id", "name", "slug", "emailLimit", "smsLimit", "price", "description", "isFree", "createdAt", "updatedAt")
VALUES (
    'plan_starter_000002',
    'Starter',
    'STARTER',
    1000,
    1000,
    20.00,
    '1,000 emails and 1,000 SMS per month. Ideal for small businesses.',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Growth Plan
INSERT INTO "SubscriptionPlan" ("id", "name", "slug", "emailLimit", "smsLimit", "price", "description", "isFree", "createdAt", "updatedAt")
VALUES (
    'plan_growth_000003',
    'Growth',
    'GROWTH',
    5000,
    5000,
    50.00,
    '5,000 emails and 5,000 SMS per month. Great for growing businesses.',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Professional Plan
INSERT INTO "SubscriptionPlan" ("id", "name", "slug", "emailLimit", "smsLimit", "price", "description", "isFree", "createdAt", "updatedAt")
VALUES (
    'plan_professional_000004',
    'Professional',
    'PROFESSIONAL',
    10000,
    10000,
    100.00,
    '10,000 emails and 10,000 SMS per month. For established businesses.',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert Enterprise Plan
INSERT INTO "SubscriptionPlan" ("id", "name", "slug", "emailLimit", "smsLimit", "price", "description", "isFree", "createdAt", "updatedAt")
VALUES (
    'plan_enterprise_000005',
    'Enterprise',
    'ENTERPRISE',
    50000,
    50000,
    1000.00,
    '50,000 emails and 50,000 SMS per month. For large organizations.',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ================================================================
-- PART 6: SEED DATA - SUPER ADMIN USER
-- ================================================================

-- Insert Super Admin
-- Email: superadmin@munshijee.ideageek.pk
-- Password: admin123!@#
-- (Password is hashed using bcrypt with salt rounds = 10)
INSERT INTO "User" ("id", "email", "name", "password", "phoneNumber", "role", "emailNotificationsEnabled", "smsNotificationsEnabled", "createdAt", "updatedAt")
VALUES (
    'user_superadmin_000001',
    'superadmin@munshijee.ideageek.pk',
    'Super Admin',
    '$2a$10$QUgZCWBvv7H90jdjKYgx3.f3gG7eL6Ha4l4gejanbmU3nn2s2pnZe',
    NULL,
    'SUPER_ADMIN',
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ================================================================
-- VERIFICATION QUERIES (Optional - Run to verify setup)
-- ================================================================

-- Verify Subscription Plans
-- SELECT "id", "name", "slug", "emailLimit", "smsLimit", "price", "isFree" FROM "SubscriptionPlan" ORDER BY "price";

-- Verify Super Admin
-- SELECT "id", "email", "name", "role", "createdAt" FROM "User" WHERE "role" = 'SUPER_ADMIN';

-- Count all tables
-- SELECT 
--     (SELECT COUNT(*) FROM "User") as users,
--     (SELECT COUNT(*) FROM "SubscriptionPlan") as plans,
--     (SELECT COUNT(*) FROM "Customer") as customers,
--     (SELECT COUNT(*) FROM "Invoice") as invoices;

-- ================================================================
-- SETUP COMPLETE!
-- ================================================================
-- 
-- You can now login with:
-- Email: superadmin@munshijee.ideageek.pk
-- Password: admin123!@#
--
-- IMPORTANT: Change the password after first login!
--
-- Next steps:
-- 1. Login to the application
-- 2. Go to Settings and configure Email/SMS API keys
-- 3. Test creating an invoice
-- 4. Verify notifications are working
-- 
-- All 5 subscription plans are ready:
-- - Free: 10 emails/month (Rs. 0)
-- - Starter: 1,000 emails & SMS (Rs. 20/month)
-- - Growth: 5,000 emails & SMS (Rs. 50/month)
-- - Professional: 10,000 emails & SMS (Rs. 100/month)
-- - Enterprise: 50,000 emails & SMS (Rs. 1,000/month)
-- ================================================================
