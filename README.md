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
   
   **Option 1: Using DBeaver (Easiest)**
   - Open DBeaver and run `dbeaver-setup.sql`
   
   **Option 2: Using Makefile**
   ```bash
   make db-setup          # Linux/Mac
   make.bat db-setup      # Windows
   ```
   
   **Option 3: Manual**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   
   **Using Makefile (Recommended):**
   ```bash
   make dev          # Linux/Mac
   make.bat dev      # Windows
   ```
   
   **Or manually:**
   ```bash
   npm run dev
   ```
   ```bash
   cd src
   make dev
   ```

6. **Access the application**
   - Open http://localhost:3000
   - Login with the admin credentials from your `.env` file

## 🛠️ Build for Production

### Quick Build

**Windows:**
```cmd
make.bat build
```

**Linux/Mac:**
```bash
make build
```

This will:
1. Install dependencies
2. Generate Prisma client
3. Build the Next.js application

### Build Output

After building, you'll have these files ready to copy:
- `.next/` - Build output
- `public/` - Static files  
- `package.json` - Dependencies
- `package-lock.json` - Lock file

### Manual Build (without Makefile)
```bash
npm install
npm run db:generate
npm run build
```

### Available Commands

| Command | Description |
|---------|-------------|
| `make build` | Build for production |
| `make install` | Install dependencies |
| `make dev` | Start development server |
| `make clean` | Clean build files |
| `make rebuild` | Clean and rebuild |

See [BUILD-GUIDE.md](./BUILD-GUIDE.md) for detailed instructions on copying files and deployment.

## 📦 Database Setup

Run `dbeaver-setup.sql` in DBeaver - it creates:
- All tables and indexes
- 5 subscription plans
- Super admin account

See [DBEAVER-SETUP.md](./DBEAVER-SETUP.md) for instructions.

## 🪟 Windows Production Deployment

If you're deploying on Windows Server and getting PM2 errors:

**Quick Solution:**
```cmd
# Simple start (for testing)
npm start

# Or use Windows Service (recommended)
# See WINDOWS-QUICK-START.txt
```

**Recommended for Production:**
1. Use NSSM (Non-Sucking Service Manager)
2. Download from: https://nssm.cc/download
3. Install as Windows Service

See [WINDOWS-DEPLOYMENT.md](./WINDOWS-DEPLOYMENT.md) for complete Windows deployment guide.

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