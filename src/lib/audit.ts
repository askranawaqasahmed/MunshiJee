import { prisma } from "@/lib/prisma";
import { Prisma, type AuditAction } from "@prisma/client";

export interface RecordAuditArgs {
  actorId: string;
  actorEmail: string;
  targetId?: string | null;
  targetEmail?: string | null;
  action: AuditAction;
  metadata?: Prisma.InputJsonValue;
}

export async function recordAudit(args: RecordAuditArgs): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: args.actorId,
        actorEmail: args.actorEmail,
        targetId: args.targetId ?? null,
        targetEmail: args.targetEmail ?? null,
        action: args.action,
        metadata: args.metadata ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}

