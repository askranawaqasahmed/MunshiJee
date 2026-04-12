# MunshiJee - Professional Invoicing Application

A comprehensive invoicing and billing management system built with Next.js, PostgreSQL, and modern web technologies.

## Features

- **Super Admin Dashboard**: Complete control over customers, invoices, sales, and payments
- **Customer Portal**: Customers can view invoices, payment history, and account summary
- **Three Invoice Types**:
  - **One-Time Invoices**: Standard invoices for one-off transactions
  - **Recurring Invoices**: Automated billing with customizable frequencies (weekly, monthly, quarterly, yearly)
  - **Bulk Invoices**: Aggregate multiple sales entries into a single invoice
- **Bulk Customer Upload**: Import customers via Excel with auto-generated passwords
- **PDF Generation**: Professional invoice PDFs with download capability
- **Background Jobs**: Automated recurring invoice generation using BullMQ
- **Payment Tracking**: Complete payment history and automated invoice status updates
- **Role-Based Access**: Separate interfaces for admins and customers

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS + shadcn/ui components
- **Background Jobs**: BullMQ + Redis
- **PDF Generation**: Puppeteer
- **Excel Parsing**: SheetJS (xlsx)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis server (optional - only needed for automated recurring invoice generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MunshiJee.git
   cd MunshiJee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/munshijee"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_EMAIL="admin@munshijee.com"
   ADMIN_PASSWORD="admin123"
   ```
   
   **Note:** Redis is optional. Uncomment `REDIS_URL` in `.env` only if you want automated recurring invoice generation.

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Or use the Makefile (in `src/` directory):
   ```bash
   cd src
   make dev
   ```

6. **Access the application**
   - Open http://localhost:3000
   - Login with the admin credentials from your `.env` file

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- [Database Schema](./docs/DATABASE.md) - Complete database structure and relationships
- [API Reference](./docs/API.md) - API endpoints and usage
- [Invoice Types & Business Logic](./docs/INVOICING.md) - Detailed invoice workflows

## Project Structure

```
MunshiJee/
├── docs/                   # Documentation
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── (admin)/       # Admin routes
│   │   ├── (customer)/    # Customer routes
│   │   ├── (auth)/        # Authentication routes
│   │   └── api/           # API routes
│   ├── components/        # React components
│   ├── lib/               # Utilities and configurations
│   ├── workers/           # Background job workers
│   ├── prisma/            # Database schema and migrations
│   └── Makefile          # Development commands
├── .env                   # Environment variables
└── package.json
```

## Available Commands

### Quick Scripts (Windows)
- **`setup-db.bat`** - One-click database setup (generate, migrate, seed)
- **`stop.bat`** - Stop all Node.js processes for this app

### Using npm:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio
- `npm run worker` - Start background worker

Using Makefile (in `src/` directory):
- `make help` - Show all available commands
- `make install` - Install dependencies
- `make dev` - Start dev server only (no worker)
- `make dev-with-worker` - Start dev server + background worker
- `make stop` - Stop all processes
- `make kill` - Force kill all Node processes
- `make db-generate` - Generate Prisma client
- `make db-migrate` - Run migrations
- `make db-seed` - Seed database
- `make db-studio` - Open Prisma Studio
- `make build` - Build for production

## Default Admin Credentials

Default credentials are set in your `.env` file:
- Email: `admin@munshijee.com`
- Password: `admin123`

**Important**: Change these in production!

## License

MIT License - See [LICENSE](./LICENSE) file for details

## Support

For issues and questions, please open an issue on GitHub.