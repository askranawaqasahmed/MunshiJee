# DBeaver Setup Guide for MunshiJee

## Quick Setup (3 Easy Steps)

### Step 1: Create Database
In DBeaver, connect to your PostgreSQL server and create a new database:

```sql
CREATE DATABASE munshijee;
```

### Step 2: Open the Script
1. In DBeaver, connect to the `munshijee` database
2. Open SQL Editor (press `Ctrl + ]` or click "New SQL Editor")
3. Open the file `dbeaver-setup.sql`
4. Or copy-paste the entire contents of `dbeaver-setup.sql` into the SQL Editor

### Step 3: Execute the Script
1. Click "Execute SQL Statement" (or press `Ctrl + Enter`)
2. Wait for the script to complete (should take 5-10 seconds)
3. Check the output log for "SETUP COMPLETE!"

That's it! Your database is ready.

## What Gets Created

### Tables (10)
- ✓ User - User accounts and authentication
- ✓ Customer - Customer contact information
- ✓ Invoice - Invoice records
- ✓ InvoiceItem - Line items for invoices
- ✓ Sale - Sales transactions
- ✓ Payment - Payment records
- ✓ Settings - Application settings (Email/SMS API keys)
- ✓ NotificationLog - Notification history
- ✓ SubscriptionPlan - Available subscription plans
- ✓ UserSubscription - User subscription assignments

### Enums (9)
- Role, InvoiceType, InvoiceStatus, RecurringFrequency, PaymentMethod, NotificationType, NotificationStatus, SubscriptionPlanType, SubscriptionStatus

### Indexes
- All necessary indexes for optimal query performance

### Foreign Keys
- All relationships properly configured with CASCADE rules

### Seed Data

#### 1. Super Admin Account
- **Email:** `superadmin@munshijee.ideageek.pk`
- **Password:** `admin123!@#`
- **Role:** SUPER_ADMIN
- **Status:** Active

#### 2. Subscription Plans (5)

| Plan | Emails | SMS | Price (Rs.) |
|------|--------|-----|-------------|
| Free | 10 | 0 | 0 |
| Starter | 1,000 | 1,000 | 20 |
| Growth | 5,000 | 5,000 | 50 |
| Professional | 10,000 | 10,000 | 100 |
| Enterprise | 50,000 | 50,000 | 1,000 |

## Verification

After running the script, verify the setup with these queries:

### Check Subscription Plans
```sql
SELECT "name", "slug", "emailLimit", "smsLimit", "price", "isFree" 
FROM "SubscriptionPlan" 
ORDER BY "price";
```

Expected: 5 rows (Free, Starter, Growth, Professional, Enterprise)

### Check Super Admin
```sql
SELECT "email", "name", "role", "createdAt" 
FROM "User" 
WHERE "role" = 'SUPER_ADMIN';
```

Expected: 1 row (superadmin@munshijee.ideageek.pk)

### Check All Tables
```sql
SELECT 
    (SELECT COUNT(*) FROM "User") as users,
    (SELECT COUNT(*) FROM "SubscriptionPlan") as plans,
    (SELECT COUNT(*) FROM "Customer") as customers,
    (SELECT COUNT(*) FROM "Invoice") as invoices,
    (SELECT COUNT(*) FROM "Settings") as settings;
```

Expected: 1 user, 5 plans, 0 customers, 0 invoices, 0 settings

## Troubleshooting

### Error: "type already exists"
The script includes `DROP TYPE IF EXISTS` commands. If you still get this error:
1. Right-click on the database → SQL Editor → New Script
2. Run this first:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
3. Then run `dbeaver-setup.sql` again

### Error: "table already exists"
The script includes `DROP TABLE IF EXISTS` commands. If tables exist with data you want to keep, backup first:
```sql
-- Backup (if needed)
CREATE TABLE "User_backup" AS SELECT * FROM "User";
```

### Error: "permission denied"
Ensure your PostgreSQL user has CREATE privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE munshijee TO your_username;
```

## Next Steps

### 1. Start Your Application
```bash
npm install
npm run build
npm start
```

### 2. Login
- URL: `http://localhost:3000/login`
- Email: `superadmin@munshijee.ideageek.pk`
- Password: `admin123!@#`

### 3. Configure API Keys
Go to Settings and configure:
- **Resend API Key** - for email notifications
- **Twilio Credentials** - for SMS notifications

### 4. Change Password
**IMPORTANT:** Change the super admin password immediately after first login!

### 5. Test the System
1. Create a customer
2. Create an invoice
3. Test email notification
4. Check notification logs

## Database Connection String

For your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/munshijee"
```

Replace:
- `username` - your PostgreSQL username
- `password` - your PostgreSQL password
- `localhost:5432` - your PostgreSQL host and port
- `munshijee` - your database name

## Clean Re-installation

If you need to start fresh:

1. Drop and recreate database:
```sql
DROP DATABASE munshijee;
CREATE DATABASE munshijee;
```

2. Run `dbeaver-setup.sql` again

## Support

- The script is idempotent (safe to run multiple times)
- All DROP commands include `IF EXISTS` clauses
- Foreign keys are properly configured with CASCADE
- Indexes are optimized for common queries

## Script Features

✓ Creates complete database schema  
✓ Seeds subscription plans  
✓ Creates super admin account  
✓ Sets up all indexes for performance  
✓ Configures foreign key relationships  
✓ Includes verification queries  
✓ Safe to re-run (drops existing objects first)  
✓ Well-commented and organized  
✓ Production-ready  

---

**File:** `dbeaver-setup.sql` (Complete all-in-one script)  
**Lines:** ~500 lines of SQL  
**Execution Time:** 5-10 seconds  
**Database:** PostgreSQL 12+
