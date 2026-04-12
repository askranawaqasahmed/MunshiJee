# Invoice Types & Business Logic

## Invoice Types

### 1. One-Time Invoice

A single invoice generated manually by the admin.

**Process:**
1. Admin selects customer from dropdown
2. Admin adds line items (description, quantity, price)
3. System calculates totals
4. Invoice is saved with status DRAFT or SENT
5. No automation or recurrence

**Use Cases:**
- Project-based billing
- One-off purchases
- Special services

### 2. Recurring Invoice

Automated invoices generated on a schedule.

**Process:**
1. Admin creates invoice template with customer, amount, and frequency
2. System sets `isRecurring = true` and `nextBillingDate`
3. Background worker runs daily checking for due invoices
4. When `nextBillingDate <= today`, worker generates new invoice
5. System advances `nextBillingDate` based on frequency

**Frequencies:**
- Weekly
- Monthly
- Quarterly
- Yearly

**Use Cases:**
- Subscription services
- Retainer agreements
- Monthly maintenance fees

### 3. Bulk Invoice

Invoice generated from aggregated sales entries.

**Process:**
1. Admin records sales throughout the period
2. At period end, admin triggers bulk invoice generation
3. System aggregates all un-invoiced sales for customer
4. Each sale becomes an invoice line item
5. Sales are marked `invoiced = true`

**Use Cases:**
- Monthly expense reports
- Accumulated charges
- Variable usage billing

## Invoice Status Flow

```
DRAFT → SENT → PAID
              ↓
          OVERDUE
              ↓
          CANCELLED
```

## Background Jobs

### Recurring Invoice Worker
- Runs daily at midnight
- Scans for invoices where `nextBillingDate <= today`
- Generates new invoice copy
- Updates `nextBillingDate`

### Bulk Invoice Aggregator
- Triggered by admin or scheduled monthly
- Aggregates un-invoiced sales
- Generates bulk invoice
- Marks sales as invoiced
