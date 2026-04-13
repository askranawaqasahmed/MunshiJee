@echo off
REM Emergency fix for production server

echo ========================================
echo Emergency Production Fix
echo ========================================
echo.

set PROD=C:\inetpub\wwwroot\munshijee.ideageek.pk

echo This will:
echo 1. Copy correct package.json
echo 2. Copy Prisma schema
echo 3. Install dependencies
echo 4. Generate Prisma client
echo.

pause

echo.
echo [1/5] Copying package.json...
copy "%~dp0package.json" "%PROD%\package.json" /Y
if %ERRORLEVEL% NEQ 0 (
    echo [91mFailed to copy package.json[0m
    pause
    exit /b 1
)
echo [92mDone[0m

echo.
echo [2/5] Creating src\prisma folder...
if not exist "%PROD%\src" mkdir "%PROD%\src"
if not exist "%PROD%\src\prisma" mkdir "%PROD%\src\prisma"
echo [92mDone[0m

echo.
echo [3/5] Copying Prisma schema...
copy "%~dp0src\prisma\schema.prisma" "%PROD%\src\prisma\schema.prisma" /Y
if %ERRORLEVEL% NEQ 0 (
    echo [91mFailed to copy schema.prisma[0m
    pause
    exit /b 1
)
echo [92mDone[0m

echo.
echo [4/5] Installing dependencies...
cd /d "%PROD%"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [91mFailed to install dependencies[0m
    pause
    exit /b 1
)
echo [92mDone[0m

echo.
echo [5/5] Generating Prisma client...
cd /d "%PROD%"
call npx prisma generate --schema=./src/prisma/schema.prisma
if %ERRORLEVEL% NEQ 0 (
    echo [91mFailed to generate Prisma client[0m
    pause
    exit /b 1
)
echo [92mDone[0m

echo.
echo ========================================
echo [92mAll fixed! Ready to start.[0m
echo ========================================
echo.
echo To start the application:
echo   cd C:\inetpub\wwwroot\munshijee.ideageek.pk
echo   npm start
echo.
echo Make sure your .env file is configured correctly!
echo.

pause
