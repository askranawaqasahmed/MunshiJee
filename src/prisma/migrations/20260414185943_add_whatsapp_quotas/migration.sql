-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "whatsappLimit" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "whatsappUsed" INTEGER NOT NULL DEFAULT 0;
