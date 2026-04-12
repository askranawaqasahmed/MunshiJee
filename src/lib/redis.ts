import { Queue, Worker, QueueEvents } from "bullmq";
import Redis from "ioredis";

let connection: Redis | null = null;
let recurringInvoicesQueue: Queue | null = null;
let bulkInvoicesQueue: Queue | null = null;

// Only initialize Redis if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    connection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    recurringInvoicesQueue = new Queue("recurring-invoices", {
      connection,
    });

    bulkInvoicesQueue = new Queue("bulk-invoices", {
      connection,
    });

    console.log("Redis connection initialized");
  } catch (error) {
    console.warn("Redis not available. Background jobs will not run.");
  }
} else {
  console.log("REDIS_URL not configured. Background jobs disabled.");
}

export { connection, recurringInvoicesQueue, bulkInvoicesQueue };
