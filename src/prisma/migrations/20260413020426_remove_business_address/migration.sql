-- AlterTable: Make contactAddress nullable
ALTER TABLE "Customer" ALTER COLUMN "contactAddress" DROP NOT NULL;

-- AlterTable: Drop businessAddress column
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "businessAddress";
