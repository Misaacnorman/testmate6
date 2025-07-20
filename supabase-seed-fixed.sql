-- Seed data for Testmate6 Supabase database - FIXED VERSION

-- Insert default roles
INSERT INTO "Role" ("name", "description", "permissions", "isSystemRole", "createdAt", "updatedAt")
VALUES 
  ('Super User', 'Full system access', '["*"]', TRUE, NOW(), NOW()),
  ('Level 01', 'Sample reception and basic lab functions', '["sample.receive", "sample.view", "test.view"]', TRUE, NOW(), NOW()),
  ('Level 02', 'Sample testing and result entry', '["sample.receive", "sample.view", "test.view", "test.perform", "test.submit"]', TRUE, NOW(), NOW()),
  ('Level 03', 'Result review and approval', '["sample.receive", "sample.view", "test.view", "test.perform", "test.submit", "test.review", "test.approve"]', TRUE, NOW(), NOW()),
  ('Level 04', 'Department management', '["sample.receive", "sample.view", "test.view", "test.perform", "test.submit", "test.review", "test.approve", "test.assign", "report.view"]', TRUE, NOW(), NOW()),
  ('Level 05', 'Laboratory management', '["sample.receive", "sample.view", "test.view", "test.perform", "test.submit", "test.review", "test.approve", "test.assign", "report.view", "report.create", "user.view"]', TRUE, NOW(), NOW()),
  ('Accounts', 'Finance and accounting', '["sample.view", "test.view", "invoice.create", "invoice.view", "payment.process", "finance.view", "report.finance"]', TRUE, NOW(), NOW());

-- Insert permissions
INSERT INTO "Permission" ("key", "description")
VALUES 
  ('sample.receive', 'Receive new samples'),
  ('sample.view', 'View sample details'),
  ('test.view', 'View test details'),
  ('test.perform', 'Perform tests'),
  ('test.submit', 'Submit test results'),
  ('test.review', 'Review test results'),
  ('test.approve', 'Approve test results'),
  ('test.assign', 'Assign tests to users'),
  ('invoice.create', 'Create invoices'),
  ('invoice.view', 'View invoices'),
  ('payment.process', 'Process payments'),
  ('finance.view', 'View financial information'),
  ('report.view', 'View reports'),
  ('report.create', 'Create reports'),
  ('report.finance', 'Access financial reports'),
  ('user.view', 'View user details'),
  ('user.create', 'Create new users'),
  ('user.edit', 'Edit user details'),
  ('user.delete', 'Delete users'),
  ('role.manage', 'Manage roles and permissions'),
  ('settings.view', 'View system settings'),
  ('settings.edit', 'Edit system settings');

-- Note: You need to create a user in the Authentication system first, then add to the User table
-- First create a user in Auth:
-- 1. Go to Authentication > Users > Add User
-- 2. Create admin@testmate.com with password admin123
-- 3. Get the UUID of this user and replace it below

-- Then insert a record in User table (replace UUID_VALUE with the actual UUID from auth.users):
-- INSERT INTO "User" ("auth_id", "username", "name", "email", "status", "roleId", "createdAt", "updatedAt")
-- VALUES ('UUID_VALUE', 'admin', 'System Administrator', 'admin@testmate.com', 'active', 1, NOW(), NOW());

-- Insert default system settings
INSERT INTO "SystemSetting" ("settingKey", "settingValue", "description", "category", "createdAt", "updatedAt")
VALUES 
  ('company.name', 'Testmate Laboratory', 'Company name for reports and invoices', 'general', NOW(), NOW()),
  ('company.address', '123 Test Street, Lab City', 'Company address for reports and invoices', 'general', NOW(), NOW()),
  ('company.phone', '+123456789', 'Company phone for reports and invoices', 'general', NOW(), NOW()),
  ('company.email', 'info@testmatelab.com', 'Company email for reports and invoices', 'general', NOW(), NOW()),
  ('invoice.prefix', 'INV', 'Prefix for invoice numbers', 'general', NOW(), NOW()),
  ('sample.prefix', 'SMP', 'Prefix for sample codes', 'general', NOW(), NOW()),
  ('tax.rate', '18', 'Default tax rate percentage', 'finance', NOW(), NOW()),
  ('notification.email', 'true', 'Enable email notifications', 'notifications', NOW(), NOW()),
  ('notification.sms', 'false', 'Enable SMS notifications', 'notifications', NOW(), NOW()),
  ('backup.frequency', 'daily', 'Database backup frequency', 'backup', NOW(), NOW()),
  ('backup.retention', '30', 'Number of days to retain backups', 'backup', NOW(), NOW());

-- Insert sample test categories
INSERT INTO "Test" ("category", "code", "name", "method", "accredited", "unit", "priceUgx", "priceUsd", "leadTimeDays", "createdAt", "updatedAt")
VALUES 
  ('Concrete', 'CMP-001', 'Compressive Strength Test', 'BS EN 12390-3:2019', TRUE, 'N/mm²', 50000, 15, 7, NOW(), NOW()),
  ('Concrete', 'SLM-001', 'Slump Test', 'BS EN 12350-2:2019', TRUE, 'mm', 30000, 10, 1, NOW(), NOW()),
  ('Aggregates', 'SIV-001', 'Sieve Analysis', 'BS EN 933-1:2012', TRUE, '%', 45000, 13, 3, NOW(), NOW()),
  ('Soil', 'CBR-001', 'California Bearing Ratio', 'BS 1377-4:1990', TRUE, '%', 65000, 20, 14, NOW(), NOW()),
  ('Soil', 'MDD-001', 'Maximum Dry Density', 'BS 1377-4:1990', TRUE, 'Mg/m³', 55000, 17, 7, NOW(), NOW()),
  ('Blocks', 'BLK-001', 'Block Compressive Strength', 'BS EN 772-1:2011', TRUE, 'N/mm²', 40000, 12, 7, NOW(), NOW()),
  ('Bricks', 'BRK-001', 'Brick Water Absorption', 'BS EN 772-21:2011', TRUE, '%', 35000, 11, 7, NOW(), NOW()),
  ('Pavers', 'PVR-001', 'Paver Compressive Strength', 'BS EN 1338:2003', TRUE, 'N/mm²', 45000, 13, 7, NOW(), NOW()),
  ('Cement', 'CEM-001', 'Setting Time', 'BS EN 196-3:2016', TRUE, 'min', 60000, 18, 3, NOW(), NOW()),
  ('Steel', 'STL-001', 'Tensile Strength', 'BS EN ISO 6892-1:2019', TRUE, 'N/mm²', 70000, 22, 5, NOW(), NOW());

-- Insert sample client for demo purposes
-- This will create a client after a user is created
-- INSERT INTO "Client" ("name", "address", "contact", "email", "phone", "status", "createdBy", "createdAt", "updatedAt")
-- VALUES ('Demo Construction Ltd.', '456 Building Road, Construction City', 'John Builder', 'contact@democonstruction.com', '+9876543210', 'active', 1, NOW(), NOW());

-- After creating client, you can create a project
-- INSERT INTO "Project" ("title", "description", "clientId", "status", "startDate", "endDate", "budget", "createdBy", "createdAt", "updatedAt")
-- VALUES ('Demo Building Project', 'A 10-story office building in the city center', 1, 'active', NOW(), NOW() + INTERVAL '365 days', 500000, 1, NOW(), NOW());

-- Create a sample client account (after creating client)
-- INSERT INTO "ClientAccount" ("clientId", "creditLimit", "currentBalance", "paymentTerms", "taxExempt", "createdAt", "updatedAt")
-- VALUES (1, 1000000, 0, '30 days', FALSE, NOW(), NOW());