import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validators";
import * as bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Scope by userId for regular users
    const where = session.user.role === "SUPER_ADMIN" 
      ? {} 
      : { userId: session.user.id };

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    // Check for duplicate email within the user's customers
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        userId: session.user.id,
        email: validatedData.email 
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "You already have a customer with this email" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        contactAddress: validatedData.contactAddress,
      },
    });

    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Error creating customer:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
