@echo off
echo Starting MunshiJee application...
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing dependencies
        pause
        exit /b %errorlevel%
    )
    echo.
)

REM Check if Prisma client is generated
if not exist "node_modules\.prisma\client\" (
    echo Prisma client not found. Generating...
    call npm run db:generate
    if %errorlevel% neq 0 (
        echo Error generating Prisma client
        pause
        exit /b %errorlevel%
    )
    echo.
)

echo Starting development server...
echo.
echo ========================================
echo MunshiJee is starting!
echo ========================================
echo.
echo Open http://localhost:3000 in your browser
echo.
echo Login with:
echo   Email: admin@munshijee.com
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
