# MunshiJee Production Setup Script (PowerShell)
# This script will set up the database and seed initial data

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "MunshiJee Production Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host "Please set it in your .env file or as an environment variable"
    exit 1
}

$DB_URL = $env:DATABASE_URL

Write-Host "Step 1: Applying database schema..." -ForegroundColor Yellow
try {
    psql $DB_URL -f deployment.sql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Schema applied successfully" -ForegroundColor Green
    } else {
        throw "Failed to apply schema"
    }
} catch {
    Write-Host "✗ Failed to apply schema" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Seeding initial data..." -ForegroundColor Yellow
try {
    psql $DB_URL -f seed-data.sql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Data seeded successfully" -ForegroundColor Green
    } else {
        throw "Failed to seed data"
    }
} catch {
    Write-Host "✗ Failed to seed data" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Super Admin Credentials:" -ForegroundColor Yellow
Write-Host "Email: superadmin@munshijee.ideageek.pk"
Write-Host "Password: admin123!@#"
Write-Host ""
Write-Host "IMPORTANT: Change the password after first login!" -ForegroundColor Red
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Build the application: npm run build"
Write-Host "2. Start the server: npm start"
Write-Host "3. Login and configure email/SMS settings"
Write-Host ""
