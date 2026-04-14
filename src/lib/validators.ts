import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  contactAddress: z.string().optional(),
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
  method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE", "EASYPAISA", "OTHER"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const easypaisaInitiateSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  transactionType: z.enum(["MA", "OTC"], {
    required_error: "Transaction type is required",
  }),
  mobileAccountNo: z.string().optional(),
  emailAddress: z.string().email().optional(),
}).refine((data) => {
  if (data.transactionType === "MA" && !data.mobileAccountNo) {
    return false;
  }
  return true;
}, {
  message: "Mobile account number is required for MA transactions",
  path: ["mobileAccountNo"],
});

export const easypaisaSettingsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  storeId: z.string().min(1, "Store ID is required"),
  accountNum: z.string().min(1, "Account number is required"),
  environment: z.enum(["sandbox", "production"]),
});

export const whatsappBartySettingsSchema = z.object({
  bearerToken: z.string().min(1, "Bearer token is required"),
  apiEndpoint: z.string().url("Valid API endpoint URL is required"),
  phoneNumberId: z.string().optional(),
});

export const whatsappWatiSettingsSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  apiEndpoint: z.string().url("Valid API endpoint URL is required"),
});

export const whatsappSettingsSchema = z.object({
  provider: z.enum(["barty", "wati"]),
  config: z.union([whatsappBartySettingsSchema, whatsappWatiSettingsSchema]),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type BulkCustomerRow = z.infer<typeof bulkCustomerRowSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type EasypaisaInitiateInput = z.infer<typeof easypaisaInitiateSchema>;
export type EasypaisaSettingsInput = z.infer<typeof easypaisaSettingsSchema>;
export type WhatsAppSettingsInput = z.infer<typeof whatsappSettingsSchema>;
