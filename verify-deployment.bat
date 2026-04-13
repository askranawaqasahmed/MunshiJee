@echo off
REM Verify deployment files for MunshiJee

echo ========================================
echo MunshiJee - Deployment Verification
echo ========================================
echo.

echo Checking required files...
echo.

REM Check package.json
if exist package.json (
    echo [92m✓[0m package.json exists
    findstr /C:"\"start\"" package.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo   [92m✓[0m start script found
    ) else (
        echo   [91m✗[0m start script missing
    )
) else (
    echo [91m✗[0m package.json NOT FOUND
)

REM Check .next folder
if exist .next (
    echo [92m✓[0m .next folder exists (build output)
) else (
    echo [91m✗[0m .next folder NOT FOUND - Run: npm run build
)

REM Check node_modules
if exist node_modules (
    echo [92m✓[0m node_modules exists
) else (
    echo [91m✗[0m node_modules NOT FOUND - Run: npm install
)

REM Check .env
if exist .env (
    echo [92m✓[0m .env file exists
) else (
    echo [91m⚠[0m .env file NOT FOUND - Create it!
)

REM Check public folder
if exist public (
    echo [92m✓[0m public folder exists
) else (
    echo [91m✗[0m public folder NOT FOUND
)

REM Check next.config.mjs
if exist next.config.mjs (
    echo [92m✓[0m next.config.mjs exists
) else (
    if exist next.config.js (
        echo [92m✓[0m next.config.js exists
    ) else (
        echo [91m⚠[0m next.config file NOT FOUND
    )
)

echo.
echo ========================================
echo Checking Node.js...
echo ========================================
echo.

node --version
if %ERRORLEVEL% EQU 0 (
    echo [92m✓[0m Node.js is installed
) else (
    echo [91m✗[0m Node.js NOT FOUND
)

echo.
echo ========================================
echo Available npm scripts:
echo ========================================
echo.
npm run 2>nul

echo.
echo ========================================
echo Current directory:
echo ========================================
echo %CD%
echo.

echo.
echo Press any key to exit...
pause >nul
