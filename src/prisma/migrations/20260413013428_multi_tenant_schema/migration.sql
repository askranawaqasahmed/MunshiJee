-- AlterEnum: Rename CUSTOMER to USER
ALTER TYPE "Role" RENAME VALUE 'CUSTOMER' TO 'USER';

-- AlterTable: Add phoneNumber to User
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;

-- AlterTable: Add userId to Customer (nullable first)
ALTER TABLE "Customer" ADD COLUMN "userId" TEXT;

-- AlterTable: Add userId to Invoice (nullable first)
ALTER TABLE "Invoice" ADD COLUMN "userId" TEXT;

-- AlterTable: Add userId to Payment (nullable first)
ALTER TABLE "Payment" ADD COLUMN "userId" TEXT;

-- AlterTable: Add userId to Sale (nullable first)
ALTER TABLE "Sale" ADD COLUMN "userId" TEXT;

-- AlterTable: Add userId to Settings (nullable)
ALTER TABLE "Settings" ADD COLUMN "userId" TEXT;

-- Data Migration: Link all existing records to super admin
DO $$
DECLARE
    super_admin_id TEXT;
BEGIN
    -- Get the super admin user ID
    SELECT id INTO super_admin_id FROM "User" WHERE role = 'SUPER_ADMIN' LIMIT 1;
    
    IF super_admin_id IS NOT NULL THEN
        -- Update all existing customers
        UPDATE "Customer" SET "userId" = super_admin_id WHERE "userId" IS NULL;
        
        -- Update all existing invoices
        UPDATE "Invoice" SET "userId" = super_admin_id WHERE "userId" IS NULL;
        
        -- Update all existing payments
        UPDATE "Payment" SET "userId" = super_admin_id WHERE "userId" IS NULL;
        
        -- Update all existing sales
        UPDATE "Sale" SET "userId" = super_admin_id WHERE "userId" IS NULL;
        
        -- Note: Settings remain nullable for super admin global settings
    END IF;
END $$;

-- AlterTable: Make userId NOT NULL (except Settings)
ALTER TABLE "Customer" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Sale" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- DropIndex: Remove customerId index from User
DROP INDEX IF EXISTS "User_customerId_idx";

-- AlterTable: Drop customerId from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "customerId";

-- CreateIndex: Add userId indexes
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");
CREATE INDEX "Settings_userId_idx" ON "Settings"("userId");

-- DropIndex: Remove unique constraint on Settings.key
DROP INDEX IF EXISTS "Settings_key_key";

-- CreateIndex: Add composite unique constraint on Settings
CREATE UNIQUE INDEX "Settings_key_userId_key" ON "Settings"("key", "userId");

-- CreateIndex: Add composite unique constraint on Customer
CREATE UNIQUE INDEX "Customer_userId_email_key" ON "Customer"("userId", "email");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
