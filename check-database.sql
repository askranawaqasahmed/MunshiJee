-- Quick Database Check Script
-- Run this in DBeaver to verify your setup

-- Check if database exists
SELECT current_database();

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if User table exists (should return 1 row)
SELECT COUNT(*) as user_table_exists
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'User';

-- Check if super admin exists (should return 1 row)
SELECT COUNT(*) as superadmin_exists
FROM "User" 
WHERE role = 'SUPER_ADMIN'
LIMIT 1;

-- Check subscription plans (should return 5 rows)
SELECT id, name, slug, "emailLimit", "smsLimit", price 
FROM "SubscriptionPlan" 
ORDER BY price;
