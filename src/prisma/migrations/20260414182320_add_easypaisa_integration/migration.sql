-- CreateEnum
CREATE TYPE "EasypaisaTransactionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "EasypaisaTransactionType" AS ENUM ('MA', 'OTC');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'EASYPAISA';

-- CreateTable
CREATE TABLE "EasypaisaTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "transactionType" "EasypaisaTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "mobileAccountNo" TEXT,
    "paymentToken" TEXT,
    "storeId" TEXT NOT NULL,
    "status" "EasypaisaTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "responseCode" TEXT,
    "responseDesc" TEXT,
    "transactionDateTime" TEXT,
    "tokenExpiryDateTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EasypaisaTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EasypaisaTransaction_orderId_key" ON "EasypaisaTransaction"("orderId");

-- CreateIndex
CREATE INDEX "EasypaisaTransaction_invoiceId_idx" ON "EasypaisaTransaction"("invoiceId");

-- CreateIndex
CREATE INDEX "EasypaisaTransaction_userId_idx" ON "EasypaisaTransaction"("userId");

-- CreateIndex
CREATE INDEX "EasypaisaTransaction_customerId_idx" ON "EasypaisaTransaction"("customerId");

-- CreateIndex
CREATE INDEX "EasypaisaTransaction_status_idx" ON "EasypaisaTransaction"("status");

-- CreateIndex
CREATE INDEX "EasypaisaTransaction_orderId_idx" ON "EasypaisaTransaction"("orderId");

-- AddForeignKey
ALTER TABLE "EasypaisaTransaction" ADD CONSTRAINT "EasypaisaTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EasypaisaTransaction" ADD CONSTRAINT "EasypaisaTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EasypaisaTransaction" ADD CONSTRAINT "EasypaisaTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
