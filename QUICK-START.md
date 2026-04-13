# 🚀 MunshiJee - Quick Start Guide

## ⚡ 3-Minute Setup

### For DBeaver Users (Easiest)

```
1. Create database:     CREATE DATABASE munshijee;
2. Open:                dbeaver-setup.sql
3. Execute:             Ctrl + Enter
4. Done! ✓
```

### For Command Line Users

```bash
# Option 1: Automated
export DATABASE_URL="postgresql://user:pass@host:5432/munshijee"
./setup-production.sh

# Option 2: Manual
psql -U username -d munshijee -f deployment.sql
psql -U username -d munshijee -f seed-data.sql

# Option 3: Prisma
npx prisma migrate deploy
npx prisma db seed
```

## 🔑 Default Credentials

**Email:** `superadmin@munshijee.ideageek.pk`  
**Password:** `admin123!@#`  

⚠️ **Change password after first login!**

## 📦 What You Get

### 5 Subscription Plans

| Plan | Monthly Cost | Emails | SMS |
|------|-------------|--------|-----|
| 🆓 Free | Rs. 0 | 10 | 0 |
| 🚀 Starter | Rs. 20 | 1,000 | 1,000 |
| 📈 Growth | Rs. 50 | 5,000 | 5,000 |
| 💼 Professional | Rs. 100 | 10,000 | 10,000 |
| 🏢 Enterprise | Rs. 1,000 | 50,000 | 50,000 |

### Complete Database
- ✓ 10 Tables
- ✓ 9 Enums
- ✓ All Indexes
- ✓ Foreign Keys
- ✓ Super Admin Account
- ✓ Subscription Plans

## 🎯 First Steps After Setup

### 1️⃣ Start Application

**Using Makefile (Recommended):**
```bash
# Linux/Mac
make deploy && make start

# Windows
make.bat deploy && make.bat start
```

**Or manually:**
```bash
npm install
npm run build
npm start
```

### 2️⃣ Login
Navigate to: `http://localhost:3000/login`

### 3️⃣ Configure Settings
Go to **Settings** page and add:
- Resend API Key (for emails)
- Twilio credentials (for SMS)

### 4️⃣ Test It Out
- Create a customer
- Create an invoice
- Send notification
- Check it worked!

## 📁 Available Files

### Primary Files
- `dbeaver-setup.sql` - ⭐ All-in-one script for DBeaver
- `deployment.sql` - Schema only (tables + indexes)
- `seed-data.sql` - Data only (admin + plans)

### Documentation
- `DBEAVER-SETUP.md` - DBeaver instructions
- `DEPLOYMENT.md` - Full deployment guide
- `DEPLOYMENT-SUMMARY.md` - Quick overview

### Scripts
- `setup-production.sh` - Linux/Mac automation
- `setup-production.ps1` - Windows automation

## 🔍 Quick Verification

After setup, run this in DBeaver to verify:

```sql
-- Should return 5 plans
SELECT COUNT(*) FROM "SubscriptionPlan";

-- Should return 1 super admin
SELECT COUNT(*) FROM "User" WHERE "role" = 'SUPER_ADMIN';

-- Should show all plans
SELECT "name", "price", "emailLimit", "smsLimit" 
FROM "SubscriptionPlan" 
ORDER BY "price";
```

## 🛠️ Environment Setup

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/munshijee"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (Configure after login in Settings)
RESEND_API_KEY=""

# SMS (Configure after login in Settings)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Redis (Optional)
REDIS_URL="redis://localhost:6379"
```

## 🎨 Features

### For Users
- ✓ Create and manage invoices
- ✓ Customer management
- ✓ Payment tracking
- ✓ Email notifications
- ✓ SMS notifications (paid plans)
- ✓ Subscription management
- ✓ Usage tracking

### For Super Admin
- ✓ User management
- ✓ Assign subscriptions
- ✓ Edit subscription plans
- ✓ View notification logs
- ✓ Configure email/SMS APIs
- ✓ Dashboard with analytics

## 🆘 Common Issues

### "Module not found"
```bash
npm install
```

### "Database connection failed"
Check your `DATABASE_URL` in `.env`

### "Login not working"
Verify super admin exists:
```sql
SELECT * FROM "User" WHERE "email" = 'superadmin@munshijee.ideageek.pk';
```

### "Notifications not sending"
1. Go to Settings
2. Configure API keys (Resend/Twilio)
3. Test with a sample invoice

## 📊 How Subscriptions Work

### New Users
- Automatically get **Free** plan
- 10 emails/month
- No SMS
- Can upgrade anytime

### Free Plan
- Resets monthly
- Auto-renews every 30 days
- Email-only notifications

### Paid Plans
- Manual assignment by super admin
- Email + SMS notifications
- Quota tracked per month
- Expires after 30 days (no auto-renewal)

### Super Admin Can
- Assign any plan to any user
- Edit plan limits and pricing
- View usage statistics
- See expiry dates

## 🔐 Security Notes

1. **Change default password** immediately
2. Use strong `NEXTAUTH_SECRET`
3. Keep API keys in `.env` (not in code)
4. Use environment variables in production
5. Enable HTTPS in production

## 📞 Support

Need help? Check:
1. `DBEAVER-SETUP.md` - DBeaver guide
2. `DEPLOYMENT.md` - Full documentation
3. Application logs for errors
4. Database connection settings

## ✅ Production Checklist

Before going live:

- [ ] Database created and seeded
- [ ] Environment variables configured
- [ ] Default password changed
- [ ] Email API configured and tested
- [ ] SMS API configured and tested (optional)
- [ ] Application builds without errors
- [ ] Can login as super admin
- [ ] Can create and send invoice
- [ ] Notifications working
- [ ] HTTPS enabled
- [ ] Backups configured

## 🎓 Learning Path

1. **Setup** - Run `dbeaver-setup.sql`
2. **Login** - Use super admin credentials
3. **Configure** - Add API keys in Settings
4. **Test** - Create a customer and invoice
5. **Explore** - Try different features
6. **Manage** - Assign subscriptions to users
7. **Monitor** - Check notification logs

---

**Ready to go?** Open DBeaver and run `dbeaver-setup.sql` 🚀

**Questions?** Read `DBEAVER-SETUP.md` for detailed instructions 📖
