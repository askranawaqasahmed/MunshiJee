#!/usr/bin/env pwsh
# Stop all development servers

Write-Host "Stopping development servers..."

# Kill processes on port 3000
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    $connections | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Killed processes on port 3000"
}

# Kill Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
if ($?) { Write-Host "Killed Node processes" }

# Kill npm processes
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
if ($?) { Write-Host "Killed npm processes" }

# Kill tsx processes
Get-Process tsx -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
if ($?) { Write-Host "Killed tsx processes" }

Write-Host "All servers stopped! Port 3000 is free."
