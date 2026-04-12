import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validators";
import { generateInvoiceNumber, calculateNextBillingDate } from "@/lib/invoice-utils";
import { sendInvoiceNotification } from "@/lib/notification-service";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {};

    if (session.user.role === "CUSTOMER" && session.user.customerId) {
      where.customerId = session.user.customerId;
    }

    // Apply filters
    if (customerId && customerId !== "all") {
      where.customerId = customerId;
    }

    if (status && status !== "all") {
      where.status = status as any;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);

    const invoiceNumber = generateInvoiceNumber();
    const billingDate = validatedData.billingDate ? new Date(validatedData.billingDate) : new Date();
    const dueDate = new Date(validatedData.dueDate);
    const issueDate = billingDate;

    let nextBillingDate = null;
    if (validatedData.isRecurring && validatedData.recurringFrequency) {
      nextBillingDate = calculateNextBillingDate(
        dueDate,
        validatedData.recurringFrequency
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: validatedData.customerId,
        type: validatedData.type,
        amount: new Prisma.Decimal(validatedData.amount),
        status: validatedData.status || "DRAFT",
        issueDate,
        dueDate,
        isRecurring: validatedData.isRecurring || false,
        recurringFrequency: validatedData.recurringFrequency,
        nextBillingDate,
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.total),
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    if (invoice.status !== "DRAFT") {
      sendInvoiceNotification(invoice.id).catch((error) => {
        console.error("Failed to send invoice notification:", error);
      });
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error("Error creating invoice:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
