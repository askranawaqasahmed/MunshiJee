@echo off
REM MunshiJee - Windows Build Script
REM Usage: make.bat [command]

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="install" goto install
if "%1"=="build" goto build
if "%1"=="dev" goto dev
if "%1"=="db-generate" goto db-generate
if "%1"=="lint" goto lint
if "%1"=="clean" goto clean
if "%1"=="rebuild" goto rebuild
goto help

:help
echo ========================================
echo MunshiJee - Build Commands
echo ========================================
echo.
echo Essential:
echo   make build        - Build for production (ready to copy)
echo   make install      - Install dependencies
echo   make dev          - Start development server
echo.
echo Database:
echo   make db-generate  - Generate Prisma client
echo.
echo Maintenance:
echo   make clean        - Clean build files
echo   make rebuild      - Clean and rebuild
echo   make lint         - Run linter
echo.
goto end

:install
echo Installing dependencies...
call npm install
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ Dependencies installed[0m
    echo.
) else (
    echo [91m✗ Installation failed[0m
    exit /b 1
)
goto end

:db-generate
echo Generating Prisma client...
call npm run db:generate
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ Prisma client generated[0m
    echo.
) else (
    echo [91m✗ Generation failed[0m
    exit /b 1
)
goto end

:build
echo ========================================
echo Building for production...
echo ========================================
echo.
echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 exit /b 1

echo [2/3] Generating Prisma client...
call npm run db:generate
if %ERRORLEVEL% NEQ 0 exit /b 1

echo [3/3] Building Next.js app...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [92m✓ Build completed successfully![0m
    echo ========================================
    echo.
    echo Build output location: .next\
    echo.
    echo Files ready to copy:
    echo   - .next\              (build output)
    echo   - public\             (static files)
    echo   - package.json        (dependencies)
    echo   - package-lock.json   (lock file)
    echo   - node_modules\       (if needed)
    echo.
) else (
    echo [91m✗ Build failed[0m
    exit /b 1
)
goto end

:dev
echo Starting development server...
call npm run dev
goto end

:lint
echo Running linter...
call npm run lint
goto end

:clean
echo Cleaning build files...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo [92m✓ Build files cleaned[0m
echo.
goto end

:rebuild
call :clean
call :build
echo [92m✓ Rebuild complete[0m
goto end

:end
