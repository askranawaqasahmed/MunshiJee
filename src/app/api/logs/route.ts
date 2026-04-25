import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: any = {};

    // For non-super-admin users, only show logs for their invoices
    if (session.user.role !== "SUPER_ADMIN") {
      where.invoice = {
        userId: session.user.id,
      };
    }

    // Apply filters
    if (type && type !== "all") {
      where.type = type;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const [logs, total, stats] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificationLog.count({ where }),
      prisma.notificationLog.groupBy({
        by: ['status', 'type'],
        where: session.user.role !== "SUPER_ADMIN" ? {
          invoice: {
            userId: session.user.id,
          },
        } : undefined,
        _count: true,
      }),
    ]);

    const statsObj = {
      total: stats.reduce((sum, stat) => sum + stat._count, 0),
      sent: stats.filter(s => s.status === 'SENT').reduce((sum, stat) => sum + stat._count, 0),
      failed: stats.filter(s => s.status === 'FAILED').reduce((sum, stat) => sum + stat._count, 0),
      pending: stats.filter(s => s.status === 'PENDING').reduce((sum, stat) => sum + stat._count, 0),
      email: stats.filter(s => s.type === 'EMAIL').reduce((sum, stat) => sum + stat._count, 0),
      sms: stats.filter(s => s.type === 'SMS').reduce((sum, stat) => sum + stat._count, 0),
      whatsapp: stats.filter(s => s.type === 'WHATSAPP').reduce((sum, stat) => sum + stat._count, 0),
    };

    return NextResponse.json({
      logs,
      stats: statsObj,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
