import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceNotification } from "@/lib/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    // Verify invoice exists and belongs to user (unless admin)
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        userId: true,
        invoiceNumber: true,
        status: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Check ownership unless admin
    if (session.user.role !== "SUPER_ADMIN" && invoice.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to resend this invoice" },
        { status: 403 }
      );
    }

    // Send notifications
    await sendInvoiceNotification(invoiceId);

    return NextResponse.json({
      success: true,
      message: "Invoice notifications have been resent",
    });
  } catch (error: any) {
    console.error("Error resending invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend invoice" },
      { status: 500 }
    );
  }
}
