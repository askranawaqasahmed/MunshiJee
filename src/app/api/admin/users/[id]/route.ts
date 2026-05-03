import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Cannot delete a super admin" },
      { status: 400 }
    );
  }

  // Cascades configured in schema (Customer/Invoice/Sale/Payment/Settings/UserSubscription/EasypaisaTransaction)
  await prisma.user.delete({ where: { id } });

  await recordAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? "",
    targetId: target.id,
    targetEmail: target.email,
    action: "USER_DELETED",
  });

  return NextResponse.json({ success: true });
}
