# MunshiJee - Invoicing Application

## Overview

MunshiJee is a professional invoicing and billing management system built with Next.js, PostgreSQL, and modern web technologies.

## Features

- **Super Admin Dashboard**: Manage customers, invoices, sales, and payments
- **Customer Portal**: View invoices, payment history, and account summary
- **Three Invoice Types**:
  - One-time invoices
  - Recurring invoices (automated)
  - Bulk invoices (aggregated from sales)
- **Bulk Customer Upload**: Import customers via Excel spreadsheet
- **PDF Generation**: Professional invoice PDFs
- **Background Jobs**: Automated recurring invoice generation
- **Payment Tracking**: Complete payment history and reporting

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis URLs
   ```

3. **Set Up Database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Or use Makefile:
   ```bash
   cd src
   make dev
   ```

5. **Access the Application**
   - Open http://localhost:3000
   - Login with admin credentials from your .env file

## Documentation

- [Database Schema](./DATABASE.md)
- [API Reference](./API.md)
- [Invoice Types & Business Logic](./INVOICING.md)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Background Jobs**: BullMQ + Redis
- **PDF Generation**: @react-pdf/renderer

## Project Structure

```
MunshiJee/
├── docs/                    # Documentation
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (admin)/        # Admin routes
│   │   ├── (customer)/     # Customer routes
│   │   ├── (auth)/         # Authentication routes
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   ├── workers/            # Background workers
│   ├── prisma/             # Database schema & migrations
│   └── Makefile           # Development commands
└── package.json
```

## License

MIT License - See LICENSE file for details
