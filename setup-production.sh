#!/bin/bash

# MunshiJee Production Setup Script
# This script will set up the database and seed initial data

echo "======================================"
echo "MunshiJee Production Setup"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Please set it in your .env file or export it"
  exit 1
fi

# Extract database details from DATABASE_URL
# Format: postgresql://username:password@host:port/database
DB_URL=$DATABASE_URL

echo "Step 1: Applying database schema..."
psql $DB_URL -f deployment.sql

if [ $? -eq 0 ]; then
  echo "✓ Schema applied successfully"
else
  echo "✗ Failed to apply schema"
  exit 1
fi

echo ""
echo "Step 2: Seeding initial data..."
psql $DB_URL -f seed-data.sql

if [ $? -eq 0 ]; then
  echo "✓ Data seeded successfully"
else
  echo "✗ Failed to seed data"
  exit 1
fi

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Super Admin Credentials:"
echo "Email: superadmin@munshijee.ideageek.pk"
echo "Password: admin123!@#"
echo ""
echo "IMPORTANT: Change the password after first login!"
echo ""
echo "Next steps:"
echo "1. Build the application: npm run build"
echo "2. Start the server: npm start"
echo "3. Login and configure email/SMS settings"
echo ""
