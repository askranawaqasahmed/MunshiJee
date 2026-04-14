@echo off
REM Create a complete deployment package that can be copied to IIS

echo ========================================
echo Creating Deployment Package
echo ========================================
echo.

set BUILD_DIR=deployment-package
set SOURCE=%~dp0

REM Clean up old deployment package
if exist "%BUILD_DIR%" (
    echo Removing old deployment package...
    rmdir /s /q "%BUILD_DIR%"
)

echo Creating deployment folder...
mkdir "%BUILD_DIR%"

echo.
echo [1/10] Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [91mBuild failed! Fix errors and try again.[0m
    pause
    exit /b 1
)
echo [92mDone[0m

echo.
echo [2/10] Copying .next folder...
xcopy ".next" "%BUILD_DIR%\.next\" /E /I /Y /Q >nul
echo [92mDone[0m

echo.
echo [3/10] Copying public folder...
xcopy "public" "%BUILD_DIR%\public\" /E /I /Y /Q >nul
echo [92mDone[0m

echo.
echo [4/10] Copying src\prisma...
xcopy "src\prisma" "%BUILD_DIR%\src\prisma\" /E /I /Y /Q >nul
echo [92mDone[0m

echo.
echo [5/10] Copying package files...
copy "package.json" "%BUILD_DIR%\" /Y >nul
copy "package-lock.json" "%BUILD_DIR%\" /Y >nul
echo [92mDone[0m

echo.
echo [6/10] Copying config files...
if exist "next.config.mjs" copy "next.config.mjs" "%BUILD_DIR%\" /Y >nul
if exist "next.config.js" copy "next.config.js" "%BUILD_DIR%\" /Y >nul
copy "tsconfig.json" "%BUILD_DIR%\" /Y >nul
if exist "postcss.config.mjs" copy "postcss.config.mjs" "%BUILD_DIR%\" /Y >nul
if exist "tailwind.config.ts" copy "tailwind.config.ts" "%BUILD_DIR%\" /Y >nul
echo [92mDone[0m

echo.
echo [7/10] Creating .env.example...
echo # MunshiJee Production Configuration > "%BUILD_DIR%\.env.example"
echo. >> "%BUILD_DIR%\.env.example"
echo # Database >> "%BUILD_DIR%\.env.example"
echo DATABASE_URL="postgresql://postgres:password@localhost:5432/munshijee?schema=public" >> "%BUILD_DIR%\.env.example"
echo. >> "%BUILD_DIR%\.env.example"
echo # Application >> "%BUILD_DIR%\.env.example"
echo NEXTAUTH_URL="https://munshijee.ideageek.pk" >> "%BUILD_DIR%\.env.example"
echo NEXTAUTH_SECRET="change-this-to-random-secret" >> "%BUILD_DIR%\.env.example"
echo NODE_ENV="production" >> "%BUILD_DIR%\.env.example"
echo [92mDone[0m

echo.
echo [8/10] Creating setup script for production...
(
echo @echo off
echo REM Run this on production server after copying files
echo.
echo echo Installing dependencies...
echo call npm install
echo.
echo echo Generating Prisma client...
echo call npx prisma generate --schema=./src/prisma/schema.prisma
echo.
echo echo.
echo echo ========================================
echo echo Setup complete!
echo echo ========================================
echo echo.
echo echo 1. Rename .env.example to .env
echo echo 2. Edit .env with your configuration
echo echo 3. Run: npm start
echo echo.
echo pause
) > "%BUILD_DIR%\setup-production.bat"
echo [92mDone[0m

echo.
echo [9/10] Creating README...
(
echo ========================================
echo MunshiJee - Deployment Package
echo ========================================
echo.
echo QUICK START:
echo.
echo 1. Copy this entire folder to your IIS server:
echo    C:\inetpub\wwwroot\munshijee.ideageek.pk
echo.
echo 2. On the server, run:
echo    setup-production.bat
echo.
echo 3. Rename .env.example to .env
echo.
echo 4. Edit .env with your database details
echo.
echo 5. Start the app:
echo    npm start
echo.
echo.
echo DATABASE SETUP:
echo.
echo If you haven't created the database yet:
echo 1. Open DBeaver
echo 2. Run dbeaver-setup.sql
echo 3. This creates tables, super admin, and subscription plans
echo.
echo.
echo SUPER ADMIN LOGIN:
echo.
echo Email: superadmin@munshijee.ideageek.pk
echo Password: admin123!@#
echo.
echo.
echo FILES INCLUDED:
echo.
echo - .next/              Build output
echo - public/             Static files
echo - src/prisma/         Database schema
echo - package.json        Dependencies
echo - All config files    Next.js, TypeScript, etc.
echo - setup-production.bat   Setup script
echo - .env.example        Environment template
echo.
echo ========================================
) > "%BUILD_DIR%\README.txt"
echo [92mDone[0m

echo.
echo [10/13] Copying database setup...
copy "dbeaver-setup.sql" "%BUILD_DIR%\" /Y >nul
echo [92mDone[0m

echo.
echo [11/13] Copying database check script...
copy "check-database.sql" "%BUILD_DIR%\" /Y >nul
echo [92mDone[0m

echo.
echo [12/13] Copying database fix script...
copy "fix-database-issue.bat" "%BUILD_DIR%\" /Y >nul
echo [92mDone[0m

echo.
echo [13/13] Copying troubleshooting guide...
copy "DATABASE-FIX-GUIDE.txt" "%BUILD_DIR%\" /Y >nul
echo [92mDone[0m

echo.
echo ========================================
echo [92mDeployment package created![0m
echo ========================================
echo.
echo Location: %BUILD_DIR%\
echo.
echo To deploy:
echo   1. Copy the "%BUILD_DIR%" folder to your IIS server
echo   2. Rename it to: C:\inetpub\wwwroot\munshijee.ideageek.pk
echo   3. Run setup-production.bat on the server
echo   4. Configure .env
echo   5. npm start
echo.
echo.
echo Press any key to open the deployment folder...
pause >nul
explorer "%BUILD_DIR%"
