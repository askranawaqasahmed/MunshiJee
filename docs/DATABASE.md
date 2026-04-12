# Database Schema

This document describes the complete database schema for MunshiJee.

## Entity Relationship Diagram

```
User (1) --- (0..1) Customer
Customer (1) --- (0..*) Invoice
Customer (1) --- (0..*) Sale
Customer (1) --- (0..*) Payment
Invoice (1) --- (0..*) InvoiceItem
Invoice (1) --- (0..*) Payment
Invoice (0..1) --- (0..*) Sale
```

## Tables

### User
Stores authentication and user account information.

**Fields:**
- `id` (String, PK): Unique identifier (CUID)
- `email` (String, Unique): User email address
- `name` (String): User's full name
- `password` (String): Hashed password
- `role` (Role): User role (SUPER_ADMIN or CUSTOMER)
- `customerId` (String, FK, Nullable): Link to Customer record
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**
- `email`
- `customerId`

### Customer
Stores customer business information.

**Fields:**
- `id` (String, PK): Unique identifier
- `name` (String): Customer name
- `email` (String, Unique): Customer email
- `phone` (String): Contact phone number
- `businessAddress` (String): Business location address
- `contactAddress` (String): Contact/billing address
- `isActive` (Boolean): Account status (default: true)
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships:**
- Has one `User` account
- Has many `Invoice` records
- Has many `Sale` records
- Has many `Payment` records

**Indexes:**
- `email`
- `isActive`

### Invoice
Core invoice records with various types and statuses.

**Fields:**
- `id` (String, PK): Unique identifier
- `invoiceNumber` (String, Unique): Human-readable invoice number (e.g., INV-202604-1234)
- `customerId` (String, FK): Customer reference
- `type` (InvoiceType): ONE_TIME, RECURRING, or BULK
- `amount` (Decimal): Total invoice amount
- `status` (InvoiceStatus): Current invoice status
- `issueDate` (DateTime): Date invoice was created
- `dueDate` (DateTime): Payment due date
- `isRecurring` (Boolean): Whether this is a recurring invoice
- `recurringFrequency` (RecurringFrequency, Nullable): Billing frequency
- `nextBillingDate` (DateTime, Nullable): Next automatic billing date
- `notes` (Text, Nullable): Additional invoice notes
- `createdAt` (DateTime): Record creation
- `updatedAt` (DateTime): Last update

**Relationships:**
- Belongs to one `Customer`
- Has many `InvoiceItem` records
- Has many `Payment` records
- Has many `Sale` records (for bulk invoices)

**Indexes:**
- `customerId`
- `invoiceNumber`
- `status`
- `nextBillingDate`

### InvoiceItem
Individual line items within an invoice.

**Fields:**
- `id` (String, PK): Unique identifier
- `invoiceId` (String, FK): Parent invoice reference
- `description` (String): Item/service description
- `quantity` (Int): Number of units
- `unitPrice` (Decimal): Price per unit
- `total` (Decimal): Line item total (quantity × unitPrice)

**Relationships:**
- Belongs to one `Invoice`

**Indexes:**
- `invoiceId`

### Sale
Sales transactions for bulk invoice aggregation.

**Fields:**
- `id` (String, PK): Unique identifier
- `customerId` (String, FK): Customer reference
- `description` (String): Sale description
- `amount` (Decimal): Sale amount
- `saleDate` (DateTime): Date of sale
- `invoiced` (Boolean): Whether included in an invoice (default: false)
- `invoiceId` (String, FK, Nullable): Invoice reference if invoiced
- `createdAt` (DateTime): Record creation

**Relationships:**
- Belongs to one `Customer`
- Optionally belongs to one `Invoice`

**Indexes:**
- `customerId`
- `invoiced`
- `saleDate`

### Payment
Payment transaction records.

**Fields:**
- `id` (String, PK): Unique identifier
- `invoiceId` (String, FK): Invoice being paid
- `customerId` (String, FK): Customer making payment
- `amount` (Decimal): Payment amount
- `paymentDate` (DateTime): Date of payment
- `method` (PaymentMethod): Payment method used
- `reference` (String, Nullable): External reference number
- `notes` (Text, Nullable): Payment notes
- `createdAt` (DateTime): Record creation

**Relationships:**
- Belongs to one `Invoice`
- Belongs to one `Customer`

**Indexes:**
- `invoiceId`
- `customerId`
- `paymentDate`

## Enums

### Role
User account types:
- `SUPER_ADMIN`: System administrator with full access
- `CUSTOMER`: Customer with limited portal access

### InvoiceType
Types of invoices:
- `ONE_TIME`: Single, non-recurring invoice
- `RECURRING`: Automatically generated on schedule
- `BULK`: Generated from aggregated sales

### InvoiceStatus
Invoice lifecycle states:
- `DRAFT`: Created but not sent
- `SENT`: Sent to customer, awaiting payment
- `PAID`: Fully paid
- `OVERDUE`: Past due date, unpaid
- `CANCELLED`: Cancelled/voided

### RecurringFrequency
Billing cycle options:
- `WEEKLY`: Every 7 days
- `MONTHLY`: Every month
- `QUARTERLY`: Every 3 months
- `YEARLY`: Every year

### PaymentMethod
Payment types:
- `CASH`: Cash payment
- `BANK_TRANSFER`: Bank/wire transfer
- `CHEQUE`: Check payment
- `ONLINE`: Online payment gateway
- `OTHER`: Other payment method

## Database Operations

### Running Migrations

Apply pending migrations:
```bash
npm run db:migrate
```

### Seeding

Create initial super admin:
```bash
npm run db:seed
```

The seed script uses credentials from `.env`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Prisma Studio

Open the database GUI:
```bash
npm run db:studio
```

## Business Logic

### Invoice Status Updates

Invoices automatically update status when:
1. A payment is recorded that equals or exceeds the invoice amount → `PAID`
2. The due date passes and status is `SENT` → `OVERDUE` (via background job)

### Recurring Invoice Generation

The background worker (`invoice-worker.ts`):
1. Checks daily for invoices where `nextBillingDate <= today`
2. Creates a new invoice copy
3. Updates original invoice's `nextBillingDate` based on `recurringFrequency`

### Bulk Invoice Creation

When generating a bulk invoice:
1. All un-invoiced sales for a customer are aggregated
2. Each sale becomes an `InvoiceItem`
3. Sales are marked `invoiced = true` and linked to the invoice

## Indexes and Performance

All foreign keys are indexed for query performance. Additional indexes:
- `User.email` - Login queries
- `Customer.isActive` - Active customer filtering
- `Invoice.status` - Invoice filtering and reporting
- `Invoice.nextBillingDate` - Recurring invoice processing
- `Sale.invoiced` - Un-invoiced sales queries

## Data Integrity

- Cascade deletes are configured for parent-child relationships
- Unique constraints on email fields prevent duplicates
- Invoice numbers are system-generated and guaranteed unique
