-- Rename Role enum value USER -> ADMIN (in place; preserves existing data)
ALTER TYPE "Role" RENAME VALUE 'USER' TO 'ADMIN';

-- Update default for User.role to ADMIN
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- Add isActive column to User
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- New AuditAction enum
CREATE TYPE "AuditAction" AS ENUM ('USER_DISABLED', 'USER_ENABLED', 'USER_DELETED', 'SUBSCRIPTION_ASSIGNED', 'SUBSCRIPTION_CHANGED');

-- New AuditLog table
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "targetId" TEXT,
    "targetEmail" TEXT,
    "action" "AuditAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_targetId_idx" ON "AuditLog"("targetId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
