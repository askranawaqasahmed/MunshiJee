# Deployment Files Overview

This directory contains all necessary files for deploying MunshiJee to production.

## Files

### 1. `deployment.sql`
Complete PostgreSQL schema with all tables, indexes, and foreign keys.

**What it does:**
- Creates all database tables
- Sets up enums (Role, InvoiceType, InvoiceStatus, etc.)
- Creates indexes for performance
- Establishes foreign key relationships

**How to use:**
```bash
psql -U username -d munshijee -f deployment.sql
```

### 2. `seed-data.sql`
Initial data required for the application to function.

**What it includes:**
- 5 Subscription Plans (Free, Starter, Growth, Professional, Enterprise)
- Super Admin user account

**How to use:**
```bash
psql -U username -d munshijee -f seed-data.sql
```

### 3. `DEPLOYMENT.md`
Comprehensive step-by-step deployment guide with:
- Database setup instructions
- Environment variable configuration
- Application deployment steps
- Production checklist
- Troubleshooting tips

### 4. Setup Scripts

#### `setup-production.sh` (Linux/Mac)
Automated setup script for Unix-based systems.

**Usage:**
```bash
chmod +x setup-production.sh
export DATABASE_URL="postgresql://user:pass@localhost:5432/munshijee"
./setup-production.sh
```

#### `setup-production.ps1` (Windows)
Automated setup script for Windows PowerShell.

**Usage:**
```powershell
$env:DATABASE_URL = "postgresql://user:pass@localhost:5432/munshijee"
.\setup-production.ps1
```

## Quick Start

### Option 1: Manual Setup (Recommended for first-time)
1. Read `DEPLOYMENT.md` for detailed instructions
2. Run `deployment.sql` to create schema
3. Run `seed-data.sql` to seed initial data
4. Configure environment variables
5. Build and start the application

### Option 2: Automated Setup
1. Set `DATABASE_URL` environment variable
2. Run setup script for your OS
3. Configure environment variables
4. Build and start the application

### Option 3: Using Prisma (If Node.js environment available)
```bash
# Apply migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

## Super Admin Credentials

After running the seed script, you can login with:

**Email:** `superadmin@munshijee.ideageek.pk`  
**Password:** `admin123!@#`

**IMPORTANT:** Change this password immediately after first login!

## Post-Deployment

1. Login to admin panel
2. Navigate to Settings
3. Configure:
   - Resend API Key (for email notifications)
   - Twilio credentials (for SMS notifications)
4. Test notification systems
5. Verify subscription plans in Admin > Subscriptions

## Environment Requirements

- PostgreSQL 12+
- Node.js 18+
- Redis (optional, for background jobs)

## Support

For issues or questions:
- Email: support@munshijee.ideageek.pk
- Documentation: See DEPLOYMENT.md
