@echo off
REM Copy MunshiJee files to production server

echo ========================================
echo MunshiJee - Copy to Production
echo ========================================
echo.

REM Set paths
set SOURCE=%~dp0
set DEST=C:\inetpub\wwwroot\munshijee.ideageek.pk

echo Source: %SOURCE%
echo Destination: %DEST%
echo.

REM Check if .next exists
if not exist "%SOURCE%.next" (
    echo [91mError: Build not found![0m
    echo Please run: make.bat build
    echo Or: npm run build
    pause
    exit /b 1
)

REM Create destination if it doesn't exist
if not exist "%DEST%" (
    echo Creating destination folder...
    mkdir "%DEST%"
)

echo Starting file copy...
echo This may take a few minutes...
echo.

echo [1/8] Copying .next folder...
robocopy "%SOURCE%.next" "%DEST%\.next" /MIR /NFL /NDL /NJH /NJS
if %ERRORLEVEL% GTR 7 (
    echo [91mError copying .next folder[0m
    pause
    exit /b 1
)

echo [2/8] Copying public folder...
robocopy "%SOURCE%public" "%DEST%\public" /MIR /NFL /NDL /NJH /NJS
if %ERRORLEVEL% GTR 7 (
    echo [91mError copying public folder[0m
    pause
    exit /b 1
)

echo [3/8] Copying package.json...
copy "%SOURCE%package.json" "%DEST%\" /Y >nul
if %ERRORLEVEL% NEQ 0 (
    echo [91mError copying package.json[0m
    pause
    exit /b 1
)

echo [4/8] Copying package-lock.json...
copy "%SOURCE%package-lock.json" "%DEST%\" /Y >nul

echo [5/8] Copying next.config.mjs...
if exist "%SOURCE%next.config.mjs" (
    copy "%SOURCE%next.config.mjs" "%DEST%\" /Y >nul
) else if exist "%SOURCE%next.config.js" (
    copy "%SOURCE%next.config.js" "%DEST%\" /Y >nul
    echo   Using next.config.js
)

echo [6/8] Copying tsconfig.json...
copy "%SOURCE%tsconfig.json" "%DEST%\" /Y >nul

echo [7/8] Copying helper scripts...
copy "%SOURCE%verify-deployment.bat" "%DEST%\" /Y >nul 2>nul
copy "%SOURCE%start-windows.bat" "%DEST%\" /Y >nul 2>nul

echo [8/8] Copying Prisma schema...
if not exist "%DEST%\src\prisma" mkdir "%DEST%\src\prisma"
copy "%SOURCE%src\prisma\schema.prisma" "%DEST%\src\prisma\" /Y >nul

echo.
echo ========================================
echo [92mFiles copied successfully![0m
echo ========================================
echo.

echo Next steps on production server:
echo.
echo 1. Open Command Prompt as Administrator
echo 2. cd C:\inetpub\wwwroot\munshijee.ideageek.pk
echo 3. npm install
echo 4. npm run db:generate
echo 5. Create .env file with your configuration
echo 6. npm start
echo.
echo Or use NSSM to install as Windows Service
echo See: WINDOWS-DEPLOYMENT.md
echo.

pause
