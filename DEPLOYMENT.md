# MunshiJee - Production Deployment Guide

## Prerequisites

- PostgreSQL database (version 12 or higher)
- Node.js 18+ installed
- Database credentials ready

## Step 1: Database Setup

### Create Database

```sql
CREATE DATABASE munshijee;
```

### Run Schema Migration

Connect to your database and run the complete schema from `deployment.sql`:

```bash
psql -U your_username -d munshijee -f deployment.sql
```

Or manually execute the SQL from `deployment.sql` file using your database client.

## Step 2: Seed Initial Data

Run the seed data script to insert subscription plans and super admin user:

```bash
psql -U your_username -d munshijee -f seed-data.sql
```

Or manually execute the SQL from `seed-data.sql` file using your database client.

This will create:
- 5 Subscription Plans (Free, Starter, Growth, Professional, Enterprise)
- Super Admin User with email: `superadmin@munshijee.ideageek.pk`

## Step 3: Environment Variables

Create a `.env` file in your production server:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/munshijee"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Admin Credentials (optional, for seed script)
ADMIN_EMAIL="superadmin@munshijee.ideageek.pk"
ADMIN_PASSWORD="admin123!@#"

# Email (Resend)
# Super admin will configure these in Settings page after login
RESEND_API_KEY=""

# SMS (Twilio)
# Super admin will configure these in Settings page after login
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Redis (Optional - for background jobs)
REDIS_URL="redis://localhost:6379"
```

## Step 4: Application Deployment

### Install Dependencies

```bash
npm install
```

### Build Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

Or use PM2:

```bash
pm2 start npm --name "munshijee" -- start
```

### Start Background Worker (Optional)

If using Redis for background jobs:

```bash
pm2 start npm --name "munshijee-worker" -- run worker
```

## Step 5: Initial Setup

### 1. Login as Super Admin
- URL: `https://yourdomain.com/login`
- Email: `superadmin@munshijee.ideageek.pk`
- Password: `admin123!@#`

### 2. Configure Email/SMS Settings
- Go to **Settings** page
- Configure **Resend API Key** for email
- Configure **Twilio credentials** for SMS
- Test both services

### 3. Verify Subscription Plans
- Go to **Subscriptions** page
- Verify all 5 plans are loaded
- Edit plans if needed (click Edit button on any plan)

## Production Checklist

- [ ] Database created and schema applied
- [ ] Subscription plans seeded
- [ ] Super admin user created
- [ ] Environment variables configured
- [ ] Application built successfully
- [ ] Application running
- [ ] Can login as super admin
- [ ] Email settings configured
- [ ] SMS settings configured (optional)
- [ ] Background worker running (optional)

## Alternative: Using Prisma Migrate (Recommended)

If you prefer to use Prisma's built-in migration tool:

```bash
# Deploy all migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

This will automatically:
- Apply all schema changes
- Seed subscription plans
- Create super admin user

## Super Admin Credentials

**Email:** `superadmin@munshijee.ideageek.pk`  
**Password:** `admin123!@#`

**Important:** Change the password after first login!

## Support

For issues or questions, contact: support@munshijee.ideageek.pk
