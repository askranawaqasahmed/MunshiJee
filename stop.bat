@echo off
echo ========================================
echo Stopping MunshiJee Application
echo ========================================
echo.

echo [1/5] Freeing port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
    echo   ^> Killed process %%a on port 3000
)

echo [2/5] Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo   ^> Node.js processes stopped
) else (
    echo   ^> No Node.js processes found
)

echo [3/5] Stopping npm processes...
taskkill /F /IM npm.exe 2>nul
if %errorlevel% equ 0 (
    echo   ^> npm processes stopped
) else (
    echo   ^> No npm processes found
)

echo [4/5] Stopping TypeScript runner (tsx)...
taskkill /F /IM tsx.exe 2>nul
if %errorlevel% equ 0 (
    echo   ^> tsx processes stopped
) else (
    echo   ^> No tsx processes found
)

echo [5/5] Stopping PowerShell npm windows...
taskkill /F /FI "WINDOWTITLE eq npm*" 2>nul

echo.
echo ========================================
echo Port 3000 is free!
echo All MunshiJee processes stopped!
echo ========================================
echo.
pause
