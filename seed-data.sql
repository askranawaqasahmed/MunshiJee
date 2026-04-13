-- MunshiJee Production Seed Data
-- Run this after applying deployment.sql

-- ============================
-- SUBSCRIPTION PLANS
-- ============================

-- Insert Free Plan
INSERT INTO "SubscriptionPlan" (id, name, slug, "emailLimit", "smsLimit", price, description, "isFree", "createdAt", "updatedAt")
VALUES (
  'sub_plan_free_00001',
  'Free',
  'FREE',
  10,
  0,
  0,
  'Free plan with 10 email notifications per month',
  true,
  NOW(),
  NOW()
);

-- Insert Starter Plan
INSERT INTO "SubscriptionPlan" (id, name, slug, "emailLimit", "smsLimit", price, description, "isFree", "createdAt", "updatedAt")
VALUES (
  'sub_plan_starter_00002',
  'Starter',
  'STARTER',
  1000,
  1000,
  20,
  '1,000 emails and 1,000 SMS per month',
  false,
  NOW(),
  NOW()
);

-- Insert Growth Plan
INSERT INTO "SubscriptionPlan" (id, name, slug, "emailLimit", "smsLimit", price, description, "isFree", "createdAt", "updatedAt")
VALUES (
  'sub_plan_growth_00003',
  'Growth',
  'GROWTH',
  5000,
  5000,
  50,
  '5,000 emails and 5,000 SMS per month',
  false,
  NOW(),
  NOW()
);

-- Insert Professional Plan
INSERT INTO "SubscriptionPlan" (id, name, slug, "emailLimit", "smsLimit", price, description, "isFree", "createdAt", "updatedAt")
VALUES (
  'sub_plan_professional_00004',
  'Professional',
  'PROFESSIONAL',
  10000,
  10000,
  100,
  '10,000 emails and 10,000 SMS per month',
  false,
  NOW(),
  NOW()
);

-- Insert Enterprise Plan
INSERT INTO "SubscriptionPlan" (id, name, slug, "emailLimit", "smsLimit", price, description, "isFree", "createdAt", "updatedAt")
VALUES (
  'sub_plan_enterprise_00005',
  'Enterprise',
  'ENTERPRISE',
  50000,
  50000,
  1000,
  '50,000 emails and 50,000 SMS per month',
  false,
  NOW(),
  NOW()
);

-- ============================
-- SUPER ADMIN USER
-- ============================

-- Insert Super Admin
-- Email: superadmin@munshijee.ideageek.pk
-- Password: admin123!@#
INSERT INTO "User" (id, email, name, password, "phoneNumber", role, "emailNotificationsEnabled", "smsNotificationsEnabled", "createdAt", "updatedAt")
VALUES (
  'user_superadmin_00001',
  'superadmin@munshijee.ideageek.pk',
  'Super Admin',
  '$2a$10$QUgZCWBvv7H90jdjKYgx3.f3gG7eL6Ha4l4gejanbmU3nn2s2pnZe',
  NULL,
  'SUPER_ADMIN',
  true,
  false,
  NOW(),
  NOW()
);

-- Verification Query (Optional - to verify data was inserted)
-- SELECT * FROM "SubscriptionPlan" ORDER BY price;
-- SELECT email, name, role FROM "User" WHERE role = 'SUPER_ADMIN';
