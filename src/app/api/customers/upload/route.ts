import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bulkCustomerRowSchema } from "@/lib/validators";
import * as bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const results = {
      success: [] as any[],
      failed: [] as any[],
    };

    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      
      if (!row[0] && !row[1]) continue;

      try {
        const rowData = {
          name: String(row[0] || "").trim(),
          email: String(row[1] || "").trim(),
          phone: String(row[2] || "").trim(),
          address: String(row[3] || "").trim(),
        };

        const validatedData = bulkCustomerRowSchema.parse(rowData);

        const existingCustomer = await prisma.customer.findUnique({
          where: { email: validatedData.email },
        });

        if (existingCustomer) {
          results.failed.push({
            row: i + 1,
            data: rowData,
            error: "Email already exists",
          });
          continue;
        }

        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await prisma.customer.create({
          data: {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            businessAddress: validatedData.address,
            contactAddress: validatedData.address,
            user: {
              create: {
                email: validatedData.email,
                name: validatedData.name,
                password: hashedPassword,
                role: "CUSTOMER",
              },
            },
          },
        });

        results.success.push({
          row: i + 1,
          customer,
          credentials: {
            name: validatedData.name,
            email: validatedData.email,
            password,
          },
        });
      } catch (error: any) {
        results.failed.push({
          row: i + 1,
          data: row,
          error: error.message || "Validation failed",
        });
      }
    }

    return NextResponse.json({
      summary: {
        total: results.success.length + results.failed.length,
        success: results.success.length,
        failed: results.failed.length,
      },
      results,
    });
  } catch (error) {
    console.error("Error uploading customers:", error);
    return NextResponse.json(
      { error: "Failed to upload customers" },
      { status: 500 }
    );
  }
}
