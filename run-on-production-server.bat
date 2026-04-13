@echo off
REM Run this script directly on the production server
REM After copying package.json and schema.prisma

echo ========================================
echo MunshiJee - Production Server Setup
echo ========================================
echo.

echo Current directory: %CD%
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo [91mError: package.json not found![0m
    echo Please make sure you're in: C:\inetpub\wwwroot\munshijee.ideageek.pk
    echo.
    echo Or copy package.json first:
    echo   copy package.json from your development machine
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [91mFailed![0m
    pause
    exit /b 1
)
echo [92mDone[0m
echo.

echo [2/4] Generating Prisma client...
if exist src\prisma\schema.prisma (
    call npx prisma generate --schema=./src/prisma/schema.prisma
) else (
    echo [91mWarning: schema.prisma not found[0m
    echo Trying to generate anyway...
    call npx prisma generate 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo [91mFailed! Make sure src\prisma\schema.prisma exists[0m
    pause
    exit /b 1
)
echo [92mDone[0m
echo.

echo [3/4] Checking .env file...
if exist .env (
    echo [92mFound .env file[0m
    findstr /C:"NODE_ENV" .env | findstr /C:"production" >nul
    if %ERRORLEVEL% NEQ 0 (
        echo [93mWarning: NODE_ENV might not be set to production[0m
        echo Please verify your .env file
    )
) else (
    echo [91mWarning: .env file not found![0m
    echo Please create .env file with:
    echo   DATABASE_URL="postgresql://user:pass@localhost:5432/munshijee"
    echo   NEXTAUTH_URL="https://munshijee.ideageek.pk"
    echo   NEXTAUTH_SECRET="your-secret-key"
    echo   NODE_ENV="production"
)
echo.

echo [4/4] Verifying setup...
echo.

REM Check if scripts are available
npm run >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ npm scripts available[0m
) else (
    echo [91m✗ npm scripts not available[0m
)

REM Check if Prisma client is installed
node -e "require('@prisma/client')" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ Prisma client installed[0m
) else (
    echo [91m✗ Prisma client not installed[0m
)

REM Check if build exists
if exist .next (
    echo [92m✓ Build output exists[0m
) else (
    echo [91m✗ Build output not found - Need to copy .next folder[0m
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.

if exist .env (
    if exist .next (
        echo [92mReady to start![0m
        echo.
        echo Run: npm start
        echo.
        echo Or install as Windows Service (see WINDOWS-DEPLOYMENT.md)
    ) else (
        echo [91mMissing .next folder[0m
        echo Copy it from: C:\Users\ranaw\source\repos\MunshiJee\.next
    )
) else (
    echo [91mMissing .env file[0m
    echo Create it with your configuration
)

echo.
pause
