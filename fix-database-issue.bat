@echo off
REM Fix Database Connection Issue

echo ========================================
echo Database Connection Fix
echo ========================================
echo.

cd /d C:\inetpub\wwwroot\munshijee.ideageek.pk

echo Step 1: Check .env file
echo ========================================
if not exist .env (
    echo [91mERROR: .env file not found![0m
    echo Create .env file first with:
    echo DATABASE_URL="postgresql://postgres:password@localhost:5432/munshijee?schema=public"
    pause
    exit /b 1
)

echo .env file exists
echo.
echo Current DATABASE_URL:
findstr "DATABASE_URL" .env
echo.

echo Step 2: Test database connection
echo ========================================
echo Testing PostgreSQL connection...
psql --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [93mWarning: psql not in PATH. Skipping connection test.[0m
    echo Install PostgreSQL client tools or verify manually in DBeaver
) else (
    echo psql found
    echo.
    echo Checking if munshijee database exists...
    echo Run this manually in psql or DBeaver:
    echo   SELECT current_database();
)
echo.

echo Step 3: Regenerate Prisma Client
echo ========================================
echo This ensures Prisma client matches your database schema
echo.

if not exist src\prisma\schema.prisma (
    echo [91mERROR: schema.prisma not found![0m
    echo Copy from development:
    echo   src\prisma\schema.prisma
    pause
    exit /b 1
)

echo Generating Prisma client...
call npx prisma generate --schema=./src/prisma/schema.prisma
if %ERRORLEVEL% NEQ 0 (
    echo [91mFailed to generate Prisma client[0m
    pause
    exit /b 1
)
echo [92mDone[0m
echo.

echo Step 4: Verify database schema
echo ========================================
echo.
echo Run check-database.sql in DBeaver to verify tables exist
echo.
echo If tables don't exist, run dbeaver-setup.sql in DBeaver
echo.

echo ========================================
echo [92mPrisma client regenerated![0m
echo ========================================
echo.
echo Next steps:
echo.
echo 1. In DBeaver, run: check-database.sql
echo    This shows if tables exist
echo.
echo 2. If no tables exist, run: dbeaver-setup.sql
echo    This creates all tables and data
echo.
echo 3. Try starting the app again:
echo    npm start
echo.

pause
