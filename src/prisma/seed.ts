import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  console.log("Seeding subscription plans...");
  const plans = [
    {
      name: "Free",
      slug: "FREE",
      emailLimit: 10,
      smsLimit: 0,
      price: 0,
      description: "Free plan with 10 email notifications per month",
      isFree: true,
    },
    {
      name: "Starter",
      slug: "STARTER",
      emailLimit: 1000,
      smsLimit: 1000,
      price: 20,
      description: "1,000 emails and 1,000 SMS per month",
      isFree: false,
    },
    {
      name: "Growth",
      slug: "GROWTH",
      emailLimit: 5000,
      smsLimit: 5000,
      price: 50,
      description: "5,000 emails and 5,000 SMS per month",
      isFree: false,
    },
    {
      name: "Professional",
      slug: "PROFESSIONAL",
      emailLimit: 10000,
      smsLimit: 10000,
      price: 100,
      description: "10,000 emails and 10,000 SMS per month",
      isFree: false,
    },
    {
      name: "Enterprise",
      slug: "ENTERPRISE",
      emailLimit: 50000,
      smsLimit: 50000,
      price: 1000,
      description: "50,000 emails and 50,000 SMS per month",
      isFree: false,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug as any },
      update: plan,
      create: plan,
    });
    console.log(`Created/updated plan: ${plan.name}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "superadmin@munshijee.ideageek.pk";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123!@#";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Super admin already exists. Skipping user creation.");
    console.log("Database seed completed!");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Super Admin",
      password: hashedPassword,
      phoneNumber: process.env.ADMIN_PHONE || "+1234567890",
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Super admin created: ${superAdmin.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log("Database seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
