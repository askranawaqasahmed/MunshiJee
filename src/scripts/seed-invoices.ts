import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const invoiceTypes = ["ONE_TIME", "RECURRING", "BULK"] as const;
const invoiceStatuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] as const;
const frequencies = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;

function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log("Starting to seed invoices...");

  // Get all customers
  const customers = await prisma.customer.findMany();

  if (customers.length === 0) {
    console.error("No customers found. Please create customers first.");
    return;
  }

  console.log(`Found ${customers.length} customers`);

  const invoicePromises = [];

  for (let i = 0; i < 50; i++) {
    const customer = randomElement(customers);
    const type = randomElement(invoiceTypes);
    const status = randomElement(invoiceStatuses);
    const isRecurring = type === "RECURRING";
    
    const issueDate = randomDate(
      new Date(2024, 0, 1),
      new Date()
    );
    
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + randomInt(15, 60));

    const itemCount = randomInt(1, 5);
    const items = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const quantity = randomInt(1, 10);
      const unitPrice = parseFloat((Math.random() * 500 + 10).toFixed(2));
      const total = parseFloat((quantity * unitPrice).toFixed(2));
      totalAmount += total;

      items.push({
        description: `Item ${j + 1} for Invoice ${i + 1}`,
        quantity,
        unitPrice: new Prisma.Decimal(unitPrice),
        total: new Prisma.Decimal(total),
      });
    }

    const invoiceData: any = {
      invoiceNumber: `INV-${Date.now()}-${i.toString().padStart(3, "0")}`,
      customerId: customer.id,
      type,
      amount: new Prisma.Decimal(totalAmount.toFixed(2)),
      status,
      issueDate,
      dueDate,
      isRecurring,
      notes: `Sample invoice ${i + 1} for testing pagination`,
      items: {
        create: items,
      },
    };

    if (isRecurring) {
      invoiceData.recurringFrequency = randomElement(frequencies);
      invoiceData.nextBillingDate = new Date(dueDate);
      invoiceData.nextBillingDate.setMonth(
        invoiceData.nextBillingDate.getMonth() + 1
      );
    }

    invoicePromises.push(prisma.invoice.create({ data: invoiceData }));

    // Create in batches to avoid overwhelming the database
    if (invoicePromises.length === 10 || i === 49) {
      await Promise.all(invoicePromises);
      console.log(`Created ${i + 1} invoices...`);
      invoicePromises.length = 0;
    }
  }

  console.log("Successfully created 50 dummy invoices!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
