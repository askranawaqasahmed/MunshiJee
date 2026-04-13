# Copy Files to Production Server

## Problem
If you get `Missing script: "start"` error, it means the `package.json` file wasn't copied properly.

## ✅ Complete File Copy Checklist

### Required Files (Must Copy)

```
Source (Development)                     → Destination (Production Server)
--------------------------------------------------------------------
.next/                                   → C:\inetpub\wwwroot\munshijee.ideageek.pk\.next\
public/                                  → C:\inetpub\wwwroot\munshijee.ideageek.pk\public\
package.json                             → C:\inetpub\wwwroot\munshijee.ideageek.pk\package.json
package-lock.json                        → C:\inetpub\wwwroot\munshijee.ideageek.pk\package-lock.json
next.config.mjs (or next.config.js)      → C:\inetpub\wwwroot\munshijee.ideageek.pk\next.config.mjs
tsconfig.json                            → C:\inetpub\wwwroot\munshijee.ideageek.pk\tsconfig.json
```

### Configuration Files (Create on Server)

```
.env                                     → Create this manually on server
```

### Optional (Can Install on Server)

```
node_modules/                            → Can skip and run "npm install" on server
```

## 📋 Step-by-Step Copy Process

### Step 1: Verify Build is Complete

On your development machine:
```cmd
cd C:\Users\ranaw\source\repos\MunshiJee

REM Verify build exists
dir .next

REM Should show folders like: cache, server, static
```

### Step 2: Copy Files to Production

**Option A: Using File Explorer (Windows)**

1. Open two File Explorer windows:
   - Window 1: `C:\Users\ranaw\source\repos\MunshiJee`
   - Window 2: `C:\inetpub\wwwroot\munshijee.ideageek.pk`

2. Copy these items from Window 1 to Window 2:
   - ✓ `.next` folder (entire folder)
   - ✓ `public` folder (entire folder)
   - ✓ `package.json` file
   - ✓ `package-lock.json` file
   - ✓ `next.config.mjs` (or `next.config.js`)
   - ✓ `tsconfig.json` file
   - ✓ `node_modules` folder (optional, can install on server)

**Option B: Using robocopy (Command Line)**

```cmd
REM Set source and destination
set SOURCE=C:\Users\ranaw\source\repos\MunshiJee
set DEST=C:\inetpub\wwwroot\munshijee.ideageek.pk

REM Copy .next folder
robocopy "%SOURCE%\.next" "%DEST%\.next" /MIR

REM Copy public folder
robocopy "%SOURCE%\public" "%DEST%\public" /MIR

REM Copy files
copy "%SOURCE%\package.json" "%DEST%\"
copy "%SOURCE%\package-lock.json" "%DEST%\"
copy "%SOURCE%\next.config.mjs" "%DEST%\"
copy "%SOURCE%\tsconfig.json" "%DEST%\"

REM Optional: Copy node_modules (or skip and run npm install)
REM robocopy "%SOURCE%\node_modules" "%DEST%\node_modules" /MIR
```

**Option C: Using xcopy**

```cmd
set SOURCE=C:\Users\ranaw\source\repos\MunshiJee
set DEST=C:\inetpub\wwwroot\munshijee.ideageek.pk

xcopy "%SOURCE%\.next" "%DEST%\.next\" /E /I /Y
xcopy "%SOURCE%\public" "%DEST%\public\" /E /I /Y
copy "%SOURCE%\package.json" "%DEST%\"
copy "%SOURCE%\package-lock.json" "%DEST%\"
copy "%SOURCE%\next.config.mjs" "%DEST%\"
copy "%SOURCE%\tsconfig.json" "%DEST%\"
```

### Step 3: Install Dependencies on Server

On production server:
```cmd
cd C:\inetpub\wwwroot\munshijee.ideageek.pk

REM Install dependencies
npm install

REM Generate Prisma client
npm run db:generate
```

### Step 4: Create .env File on Server

On production server, create `C:\inetpub\wwwroot\munshijee.ideageek.pk\.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/munshijee"
NEXTAUTH_URL="https://munshijee.ideageek.pk"
NEXTAUTH_SECRET="your-production-secret-key-change-this"
NODE_ENV="production"
```

### Step 5: Verify Deployment

On production server:
```cmd
cd C:\inetpub\wwwroot\munshijee.ideageek.pk

REM Run verification
verify-deployment.bat

REM Or manually check
npm run
```

You should see:
```
Scripts available in munshijee@0.1.0 via `npm run-script`:
  dev
    next dev
  build
    next build
  start
    next start
  lint
    next lint
  ...
```

### Step 6: Test Start

```cmd
npm start
```

Should show:
```
> munshijee@0.1.0 start
> next start

▲ Next.js 15.1.4
- Local:        http://localhost:3000
```

## 🔍 Verification Script

Copy and run `verify-deployment.bat` on your production server to check all files:

```cmd
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
verify-deployment.bat
```

## ⚠️ Common Issues

### Issue 1: "Missing script: start"
**Cause:** `package.json` not copied or corrupted
**Fix:** 
```cmd
REM Copy from source
copy C:\Users\ranaw\source\repos\MunshiJee\package.json C:\inetpub\wwwroot\munshijee.ideageek.pk\
```

### Issue 2: "Cannot find module '.next/...'"
**Cause:** `.next` folder not copied
**Fix:** 
```cmd
REM Copy .next folder
robocopy C:\Users\ranaw\source\repos\MunshiJee\.next C:\inetpub\wwwroot\munshijee.ideageek.pk\.next /MIR
```

### Issue 3: "Module not found"
**Cause:** Dependencies not installed
**Fix:**
```cmd
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
npm install
```

### Issue 4: "Prisma Client not generated"
**Cause:** Prisma client not generated on server
**Fix:**
```cmd
npm run db:generate
```

## 📦 Quick Copy Script

Save this as `copy-to-production.bat`:

```cmd
@echo off
set SOURCE=C:\Users\ranaw\source\repos\MunshiJee
set DEST=C:\inetpub\wwwroot\munshijee.ideageek.pk

echo Copying files to production...
echo.

echo [1/7] Copying .next folder...
robocopy "%SOURCE%\.next" "%DEST%\.next" /MIR /NFL /NDL /NJH

echo [2/7] Copying public folder...
robocopy "%SOURCE%\public" "%DEST%\public" /MIR /NFL /NDL /NJH

echo [3/7] Copying package.json...
copy "%SOURCE%\package.json" "%DEST%\" /Y >nul

echo [4/7] Copying package-lock.json...
copy "%SOURCE%\package-lock.json" "%DEST%\" /Y >nul

echo [5/7] Copying next.config.mjs...
copy "%SOURCE%\next.config.mjs" "%DEST%\" /Y >nul

echo [6/7] Copying tsconfig.json...
copy "%SOURCE%\tsconfig.json" "%DEST%\" /Y >nul

echo [7/7] Copying verification script...
copy "%SOURCE%\verify-deployment.bat" "%DEST%\" /Y >nul

echo.
echo [92mFiles copied successfully![0m
echo.
echo Next steps:
echo 1. cd C:\inetpub\wwwroot\munshijee.ideageek.pk
echo 2. npm install
echo 3. npm run db:generate
echo 4. Create .env file
echo 5. npm start
echo.
pause
```

## ✅ Final Checklist

Before starting the application:

- [ ] `.next` folder copied
- [ ] `public` folder copied
- [ ] `package.json` copied
- [ ] `package-lock.json` copied
- [ ] `next.config.mjs` copied
- [ ] `tsconfig.json` copied
- [ ] `.env` file created
- [ ] `npm install` completed
- [ ] `npm run db:generate` completed
- [ ] Database setup complete (`dbeaver-setup.sql` run)
- [ ] `npm start` works without errors

## 🚀 After Files Are Copied

```cmd
cd C:\inetpub\wwwroot\munshijee.ideageek.pk

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Test
npm start

# Install as service (see WINDOWS-DEPLOYMENT.md)
```

---

**Quick Fix:**
If you just need to fix the missing start script right now:
```cmd
copy C:\Users\ranaw\source\repos\MunshiJee\package.json C:\inetpub\wwwroot\munshijee.ideageek.pk\
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
npm install
npm start
```
