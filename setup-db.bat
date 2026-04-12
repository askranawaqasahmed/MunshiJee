@echo off
echo Setting up MunshiJee database...
echo.

cd /d "%~dp0"

echo Step 1: Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo Error generating Prisma client
    pause
    exit /b %errorlevel%
)
echo.

echo Step 2: Running migrations...
call npm run db:migrate
if %errorlevel% neq 0 (
    echo Error running migrations
    pause
    exit /b %errorlevel%
)
echo.

echo Step 3: Seeding database with admin user...
call npm run db:seed
if %errorlevel% neq 0 (
    echo Error seeding database
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================
echo Database setup complete!
echo ========================================
echo.
echo You can now start the application:
echo   npm run dev
echo.
echo Login with:
echo   Email: admin@munshijee.com
echo   Password: admin123
echo.
pause
