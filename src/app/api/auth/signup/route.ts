import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validators";
import { getWelcomeEmailTemplate } from "@/lib/email-templates";
import { EmailService } from "@/lib/email-service";

import type { EmailConfig } from "@/lib/email-service";

async function getSuperAdminEmailSettings(): Promise<EmailConfig | null> {
  try {
    const [providerSetting, configSetting] = await Promise.all([
      prisma.settings.findFirst({
        where: { key: "email_provider", userId: null },
      }),
      prisma.settings.findFirst({
        where: { key: "email_config", userId: null },
      }),
    ]);

    if (!providerSetting || !configSetting) {
      return null;
    }

    return {
      provider: providerSetting.value as "resend",
      config: configSetting.value as any,
    };
  } catch (error) {
    console.error("Error fetching super admin email settings:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Auto-assign Free subscription plan
    try {
      const freePlan = await prisma.subscriptionPlan.findFirst({
        where: { slug: 'FREE' },
      });

      if (freePlan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await prisma.userSubscription.create({
          data: {
            userId: user.id,
            planId: freePlan.id,
            status: 'ACTIVE',
            startDate,
            endDate,
            emailsUsed: 0,
            smsUsed: 0,
          },
        });

        console.log(`Free subscription assigned to user ${user.email}`);
      } else {
        console.warn('Free subscription plan not found in database');
      }
    } catch (subscriptionError) {
      console.error('Failed to assign free subscription:', subscriptionError);
      // Don't fail the signup if subscription assignment fails
    }

    // Send welcome email via super admin's email settings
    try {
      const emailSettings = await getSuperAdminEmailSettings();
      
      if (emailSettings) {
        const emailService = new EmailService(emailSettings);

        const emailHtml = getWelcomeEmailTemplate({
          name: user.name,
          email: user.email,
        });

        await emailService.send({
          to: user.email,
          subject: "Welcome to MunshiJee - Your Account is Ready!",
          html: emailHtml,
        });

        console.log(`Welcome email sent to ${user.email}`);
      } else {
        console.warn("Super admin email settings not configured. Skipping welcome email.");
      }
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the signup if email fails
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred during signup. Please try again." },
      { status: 500 }
    );
  }
}
