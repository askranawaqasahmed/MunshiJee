@echo off
REM MunshiJee - Windows Production Start Script
REM Run this to start the application on Windows

echo ========================================
echo Starting MunshiJee Application
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [91mError: .env file not found![0m
    echo Please create .env file with your configuration
    pause
    exit /b 1
)

REM Check if .next exists
if not exist .next (
    echo [91mError: Build not found![0m
    echo Please run: npm run build
    pause
    exit /b 1
)

echo Starting production server...
echo.
echo Application will be available at:
echo   http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the application
npm start
