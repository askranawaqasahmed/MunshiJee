import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  contactAddress: z.string().min(1, "Contact address is required"),
});

export const bulkCustomerRowSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  total: z.number().min(0, "Total must be positive"),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  type: z.enum(["ONE_TIME", "RECURRING", "BULK"]),
  amount: z.number().min(0, "Amount must be positive"),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  billingDate: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  nextBillingDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export const saleSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount must be positive"),
  saleDate: z.string().optional(),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  customerId: z.string().min(1, "Customer is required"),
  amount: z.number().min(0, "Amount must be positive"),
  paymentDate: z.string().optional(),
  method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE", "OTHER"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type BulkCustomerRow = z.infer<typeof bulkCustomerRowSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
