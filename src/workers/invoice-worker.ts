import { Worker } from "bullmq";
import { PrismaClient, Prisma } from "@prisma/client";
import { connection } from "../lib/redis";
import { generateInvoiceNumber, calculateNextBillingDate } from "../lib/invoice-utils";
import { sendInvoiceNotification } from "../lib/notification-service";

const prisma = new PrismaClient();

async function processRecurringInvoices() {
  console.log("Processing recurring invoices...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueInvoices = await prisma.invoice.findMany({
    where: {
      isRecurring: true,
      nextBillingDate: {
        lte: today,
      },
    },
    include: {
      items: true,
      customer: true,
    },
  });

  console.log(`Found ${dueInvoices.length} invoices due for generation`);

  for (const invoice of dueInvoices) {
    try {
      const invoiceNumber = generateInvoiceNumber();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30);

      const nextBillingDate = calculateNextBillingDate(
        today,
        invoice.recurringFrequency!
      );

      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: invoice.userId,
          customerId: invoice.customerId,
          type: invoice.type,
          amount: invoice.amount,
          status: "SENT",
          issueDate: today,
          dueDate,
          isRecurring: true,
          recurringFrequency: invoice.recurringFrequency,
          nextBillingDate: null,
          notes: `Auto-generated recurring invoice from ${invoice.invoiceNumber}`,
          items: {
            create: invoice.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
      });

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { nextBillingDate },
      });

      sendInvoiceNotification(newInvoice.id).catch((error) => {
        console.error(`Failed to send notification for invoice ${invoiceNumber}:`, error);
      });

      console.log(
        `Generated invoice ${invoiceNumber} for customer ${invoice.customer.name}`
      );
    } catch (error) {
      console.error(
        `Error generating invoice for ${invoice.invoiceNumber}:`,
        error
      );
    }
  }

  console.log("Recurring invoice processing complete");
}

if (connection) {
  const recurringInvoicesWorker = new Worker(
    "recurring-invoices",
    async (job) => {
      console.log(`Processing job ${job.id}`);
      await processRecurringInvoices();
    },
    { connection }
  );

  recurringInvoicesWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  recurringInvoicesWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  console.log("Invoice worker started. Listening for jobs...");
  
  process.on("SIGINT", async () => {
    console.log("Shutting down worker...");
    await recurringInvoicesWorker.close();
    await prisma.$disconnect();
    process.exit(0);
  });
} else {
  console.warn("Redis connection not available. Worker not started.");
}

setInterval(async () => {
  console.log("Running scheduled recurring invoice check...");
  await processRecurringInvoices();
}, 24 * 60 * 60 * 1000);
