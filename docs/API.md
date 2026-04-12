# API Reference

Complete API documentation for MunshiJee invoicing system.

## Authentication

All API routes except `/api/auth/*` require authentication via NextAuth.js session.

### POST /api/auth/[...nextauth]
NextAuth.js authentication endpoints.

**Actions:**
- `signin`: Login with credentials
- `signout`: Logout current user
- `session`: Get current session

**Example Login:**
```typescript
import { signIn } from "next-auth/react";

await signIn("credentials", {
  email: "admin@munshijee.com",
  password: "admin123",
  redirect: false,
});
```

## Customers

### GET /api/customers
List all customers.

**Authorization:** Super Admin only

**Response:**
```json
{
  "customers": [
    {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "businessAddress": "123 Main St",
      "contactAddress": "123 Main St",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "clx...",
        "email": "john@example.com",
        "name": "John Doe"
      }
    }
  ]
}
```

### POST /api/customers
Create a new customer with auto-generated user account.

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "businessAddress": "456 Oak Ave",
  "contactAddress": "456 Oak Ave"
}
```

**Response:**
```json
{
  "customer": { /* customer object */ },
  "credentials": {
    "email": "jane@example.com",
    "password": "AutoGen123!@#"
  }
}
```

### GET /api/customers/[id]
Get customer details by ID.

**Authorization:** Super Admin only

**Response:** Single customer object

### PUT /api/customers/[id]
Update customer information.

**Authorization:** Super Admin only

**Request Body:** Same as POST (all fields required)

### DELETE /api/customers/[id]
Delete a customer (cascades to user account).

**Authorization:** Super Admin only

### POST /api/customers/upload
Bulk upload customers from Excel file.

**Authorization:** Super Admin only

**Request:** `multipart/form-data` with file field

**Excel Format:**
- Column A: Name
- Column B: Email
- Column C: Phone
- Column D: Address

**Response:**
```json
{
  "summary": {
    "total": 10,
    "success": 8,
    "failed": 2
  },
  "results": {
    "success": [
      {
        "row": 2,
        "customer": { /* customer object */ },
        "credentials": {
          "name": "...",
          "email": "...",
          "password": "..."
        }
      }
    ],
    "failed": [
      {
        "row": 5,
        "data": ["...", "..."],
        "error": "Email already exists"
      }
    ]
  }
}
```

## Invoices

### GET /api/invoices
List invoices (filtered by role).

**Authorization:** All authenticated users
- Super Admin: sees all invoices
- Customer: sees only their invoices

**Response:**
```json
{
  "invoices": [
    {
      "id": "clx...",
      "invoiceNumber": "INV-202604-1234",
      "customerId": "clx...",
      "type": "ONE_TIME",
      "amount": "1500.00",
      "status": "SENT",
      "issueDate": "2024-04-01T00:00:00.000Z",
      "dueDate": "2024-04-30T00:00:00.000Z",
      "isRecurring": false,
      "recurringFrequency": null,
      "nextBillingDate": null,
      "notes": "Payment due within 30 days",
      "customer": {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "id": "clx...",
          "description": "Consulting Services",
          "quantity": 10,
          "unitPrice": "150.00",
          "total": "1500.00"
        }
      ],
      "_count": {
        "payments": 0
      }
    }
  ]
}
```

### POST /api/invoices
Create a new invoice.

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "customerId": "clx...",
  "type": "ONE_TIME" | "RECURRING" | "BULK",
  "amount": 1500.00,
  "status": "DRAFT" | "SENT",
  "dueDate": "2024-04-30",
  "isRecurring": false,
  "recurringFrequency": "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" (optional),
  "nextBillingDate": "2024-05-30" (optional),
  "notes": "Optional notes",
  "items": [
    {
      "description": "Item description",
      "quantity": 1,
      "unitPrice": 1500.00,
      "total": 1500.00
    }
  ]
}
```

**Response:** Created invoice object

### GET /api/invoices/[id]/pdf
Download invoice as PDF.

**Authorization:** All authenticated users (own invoices only for customers)

**Response:** PDF file stream

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="invoice-[id].pdf"`

## Sales

### GET /api/sales
List all sale entries.

**Authorization:** Super Admin only

**Response:**
```json
{
  "sales": [
    {
      "id": "clx...",
      "customerId": "clx...",
      "description": "Product sale",
      "amount": "250.00",
      "saleDate": "2024-04-15T00:00:00.000Z",
      "invoiced": false,
      "invoiceId": null,
      "customer": {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "invoice": null
    }
  ]
}
```

### POST /api/sales
Create a new sale entry.

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "customerId": "clx...",
  "description": "Product XYZ sale",
  "amount": 250.00,
  "saleDate": "2024-04-15" (optional, defaults to today)
}
```

**Response:** Created sale object

## Payments

### GET /api/payments
List payment transactions.

**Authorization:** All authenticated users
- Super Admin: sees all payments
- Customer: sees only their payments

**Response:**
```json
{
  "payments": [
    {
      "id": "clx...",
      "invoiceId": "clx...",
      "customerId": "clx...",
      "amount": "500.00",
      "paymentDate": "2024-04-20T00:00:00.000Z",
      "method": "BANK_TRANSFER",
      "reference": "TXN123456",
      "notes": "First installment",
      "customer": {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "invoice": {
        "id": "clx...",
        "invoiceNumber": "INV-202604-1234"
      }
    }
  ]
}
```

### POST /api/payments
Record a new payment.

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "invoiceId": "clx...",
  "customerId": "clx...",
  "amount": 500.00,
  "paymentDate": "2024-04-20" (optional, defaults to today),
  "method": "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE" | "OTHER",
  "reference": "TXN123456" (optional),
  "notes": "Payment notes" (optional)
}
```

**Response:** Created payment object

**Side Effect:** If total payments >= invoice amount, invoice status automatically updates to `PAID`

## Error Responses

All endpoints return standard error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to process request"
}
```
