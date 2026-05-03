import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { isActive?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json(
      { error: "isActive must be a boolean" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Cannot change status of a super admin" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  await recordAudit({
    actorId: session.user.id,
    actorEmail: session.user.email ?? "",
    targetId: target.id,
    targetEmail: target.email,
    action: body.isActive ? "USER_ENABLED" : "USER_DISABLED",
  });

  return NextResponse.json({
    user: { id: updated.id, isActive: updated.isActive },
  });
}
