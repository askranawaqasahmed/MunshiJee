# Simple IIS Deployment - Copy & Paste Method

## What You're Used To vs This Project

### Your Other Projects (Simple):
```
1. npm run build
2. Copy build folder to IIS
3. npm start
4. Done!
```

### Why This Project is Different:
- **Prisma ORM** needs schema and client generation
- **Next.js** needs specific files
- **Database** needs to be setup first

## ✅ Simple Solution - 3 Steps

### Step 1: Create Deployment Package (On Dev Machine)

```cmd
cd C:\Users\ranaw\source\repos\MunshiJee
create-deployment-package.bat
```

This creates a `deployment-package` folder with EVERYTHING you need.

### Step 2: Copy to IIS Server

Copy the entire `deployment-package` folder to:
```
C:\inetpub\wwwroot\munshijee.ideageek.pk
```

### Step 3: Setup on IIS Server

```cmd
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
setup-production.bat
```

Then:
1. Rename `.env.example` to `.env`
2. Edit `.env` with your database details
3. Run: `npm start`

## 📦 What's in the Deployment Package

```
deployment-package/
├── .next/                      ← Build output (like your other projects)
├── public/                     ← Static files (like your other projects)
├── src/prisma/                 ← Database schema (NEW - needed for Prisma)
├── package.json                ← Dependencies (like your other projects)
├── package-lock.json           ← Lock file
├── next.config.mjs             ← Next.js config
├── tsconfig.json               ← TypeScript config
├── dbeaver-setup.sql           ← Database setup script
├── setup-production.bat        ← Run this first on server
├── .env.example                ← Configuration template
└── README.txt                  ← Instructions
```

## 🎯 The Key Difference

Your other projects: Just copy build output

This project: Copy build output + schema + run setup script

### Why the Setup Script?
1. `npm install` - Install dependencies
2. `npx prisma generate` - Generate database client (like ORM models)

## 🗄️ Database Setup

You said you created the database manually. You need to create tables:

### Option 1: Using DBeaver (Easiest)
1. Open DBeaver
2. Connect to your PostgreSQL database
3. Open `dbeaver-setup.sql` from the deployment package
4. Execute it

This creates:
- All tables
- Super admin account
- Subscription plans

### Option 2: Using psql
```cmd
psql -U postgres -d munshijee -f dbeaver-setup.sql
```

## 📝 Complete Step-by-Step

### On Development Machine:

```cmd
# 1. Build the package
cd C:\Users\ranaw\source\repos\MunshiJee
create-deployment-package.bat

# 2. This creates: deployment-package\ folder
```

### Copy to Server:

```
Copy from: C:\Users\ranaw\source\repos\MunshiJee\deployment-package\
Copy to: C:\inetpub\wwwroot\munshijee.ideageek.pk\
```

### On IIS Server:

```cmd
# 3. Setup dependencies
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
setup-production.bat

# 4. Configure environment
rename .env.example .env
notepad .env

# Edit these values:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/munshijee"
# NEXTAUTH_URL="https://munshijee.ideageek.pk"
# NODE_ENV="production"

# 5. Setup database (if not done)
# Open DBeaver and run dbeaver-setup.sql

# 6. Start the application
npm start
```

## ✅ Verification

After `npm start`, you should see:
```
> munshijee@0.1.0 start
> next start

▲ Next.js 15.1.4
- Local:        http://localhost:3000

✓ Ready in XXXms
```

Open browser: `http://localhost:3000`

Login:
- Email: `superadmin@munshijee.ideageek.pk`
- Password: `admin123!@#`

## 🌐 For IIS Integration (After npm start works)

Once `npm start` works, you can set up IIS reverse proxy or use iisnode.

### Quick IIS Setup:
1. Install URL Rewrite module
2. Install ARR (Application Request Routing)
3. Create reverse proxy to `http://localhost:3000`

Or use NSSM to run as Windows Service (see WINDOWS-DEPLOYMENT.md).

## 🔧 Troubleshooting

### "Cannot find module"
```cmd
npm install
```

### "Prisma Client not generated"
```cmd
npx prisma generate --schema=./src/prisma/schema.prisma
```

### "Database connection failed"
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check if database 'munshijee' exists
- Run dbeaver-setup.sql if tables don't exist

### "Port 3000 already in use"
```cmd
set PORT=8080
npm start
```

## 📦 What Makes This Different from Your Other Projects

| Feature | Your Other Projects | This Project |
|---------|-------------------|--------------|
| Build Output | ✓ Copy .next/ | ✓ Copy .next/ |
| Static Files | ✓ Copy public/ | ✓ Copy public/ |
| Config Files | ✓ package.json | ✓ package.json |
| Database ORM | ❌ None | ✓ Prisma (needs schema) |
| Setup Step | ❌ None | ✓ npm install + prisma generate |
| Database | ❌ None | ✓ PostgreSQL (needs setup) |

## 🎯 Summary

**Your way (almost the same):**
1. Build → Copy → Start

**This project (one extra step):**
1. Build → Copy → **Setup (npm install + prisma)** → Start

The `create-deployment-package.bat` script makes it easy by bundling everything in one folder!

---

**Quick Command:**
```cmd
create-deployment-package.bat
```

Then copy `deployment-package\` to IIS and run `setup-production.bat`! 🚀
