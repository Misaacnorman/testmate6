-- Create tables based on Prisma schema for Testmate6

-- Create Role table first since other tables reference it
CREATE TABLE "Role" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "permissions" TEXT NOT NULL, -- JSON array of permission keys
  "isSystemRole" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create User table
CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "status" TEXT DEFAULT 'active' NOT NULL, -- active, inactive, suspended
  "phoneNumber" TEXT,
  "lastLogin" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "department" TEXT,
  "roleId" INTEGER NOT NULL REFERENCES "Role"("id"),
  "customPermissions" TEXT -- JSON array of permission keys
);

-- Create Permission table
CREATE TABLE "Permission" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT UNIQUE NOT NULL, -- e.g., 'sample.receive', 'test.perform', etc.
  "description" TEXT NOT NULL
);

-- Create Client table
CREATE TABLE "Client" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "contact" TEXT,
  "billingName" TEXT, -- For separate billing info
  "billingAddress" TEXT,
  "billingContact" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "status" TEXT DEFAULT 'active' NOT NULL, -- active, inactive
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "sampleDescription" TEXT, -- Description of the sample
  "sampleStatus" TEXT -- Status of the sample
);

-- Create ClientAccount table
CREATE TABLE "ClientAccount" (
  "id" SERIAL PRIMARY KEY,
  "clientId" INTEGER UNIQUE NOT NULL REFERENCES "Client"("id"),
  "creditLimit" FLOAT DEFAULT 0 NOT NULL,
  "currentBalance" FLOAT DEFAULT 0 NOT NULL,
  "paymentTerms" TEXT DEFAULT '30 days' NOT NULL, -- Net 30, Net 60, etc.
  "taxExempt" BOOLEAN DEFAULT FALSE NOT NULL,
  "taxNumber" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Project table
CREATE TABLE "Project" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "clientId" INTEGER NOT NULL REFERENCES "Client"("id"),
  "status" TEXT DEFAULT 'active' NOT NULL, -- active, completed, cancelled
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "budget" FLOAT,
  "createdBy" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Test table
CREATE TABLE "Test" (
  "id" SERIAL PRIMARY KEY,
  "category" TEXT NOT NULL, -- MATERIAL CATEGORY
  "code" TEXT UNIQUE NOT NULL, -- TEST CODE
  "name" TEXT NOT NULL, -- MATERIAL TEST
  "method" TEXT NOT NULL, -- TEST METHOD(S)
  "accredited" BOOLEAN NOT NULL, -- TEST ACCREDITATION STATUS
  "unit" TEXT, -- UNIT
  "priceUgx" INTEGER, -- AMOUNT (UGX)
  "priceUsd" FLOAT, -- AMOUNT (USD)
  "leadTimeDays" INTEGER, -- LEAD TIME (DAYS)
  "status" TEXT DEFAULT 'active' NOT NULL, -- active, inactive
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Sample table
CREATE TABLE "Sample" (
  "id" SERIAL PRIMARY KEY,
  "sampleCode" TEXT UNIQUE NOT NULL, -- Auto-generated code like SMP-2025-001
  "projectId" INTEGER NOT NULL REFERENCES "Project"("id"),
  "clientId" INTEGER NOT NULL REFERENCES "Client"("id"),
  "assignedTo" INTEGER REFERENCES "User"("id"),
  "status" TEXT DEFAULT 'received' NOT NULL, -- received, processing, completed, overdue
  "priority" TEXT DEFAULT 'medium' NOT NULL, -- low, medium, high
  "receivedDate" TIMESTAMPTZ NOT NULL,
  "expectedCompletionDate" TIMESTAMPTZ,
  "actualCompletionDate" TIMESTAMPTZ,
  "deliveryInfo" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create SampleTest table
CREATE TABLE "SampleTest" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER NOT NULL REFERENCES "Sample"("id"),
  "testId" INTEGER NOT NULL REFERENCES "Test"("id"),
  "result" TEXT, -- Test outcome
  "submittedBy" INTEGER REFERENCES "User"("id"),
  "reviewedBy" INTEGER REFERENCES "User"("id"),
  "approvedBy" INTEGER REFERENCES "User"("id"),
  "submittedAt" TIMESTAMPTZ,
  "reviewedAt" TIMESTAMPTZ,
  "approvedAt" TIMESTAMPTZ,
  "status" TEXT DEFAULT 'pending' NOT NULL, -- pending, in_progress, completed, failed
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create TestResult table
CREATE TABLE "TestResult" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER NOT NULL REFERENCES "Sample"("id"),
  "testId" INTEGER NOT NULL REFERENCES "Test"("id"),
  "sampleTestId" INTEGER REFERENCES "SampleTest"("id"),
  "resultValue" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "specification" TEXT,
  "status" TEXT DEFAULT 'pending' NOT NULL, -- pass, fail, pending, in_progress
  "testedBy" INTEGER NOT NULL REFERENCES "User"("id"),
  "testedDate" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "approvedBy" INTEGER REFERENCES "User"("id"),
  "approvedDate" TIMESTAMPTZ,
  "remarks" TEXT,
  "attachments" TEXT, -- JSON string of attachment paths
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create SampleLog table
CREATE TABLE "SampleLog" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER NOT NULL REFERENCES "Sample"("id"),
  "receivedBy" INTEGER NOT NULL REFERENCES "User"("id"),
  "deliveredBy" TEXT,
  "deliveryContact" TEXT,
  "modeOfTransmit" TEXT NOT NULL, -- Email, WhatsApp, Hardcopy
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "dateOfReceipt" TIMESTAMPTZ, -- Date of receipt
  "timeOfReceipt" TEXT, -- Time of receipt (string for flexibility)
  "receivedByName" TEXT -- Name of the person who received the sample
);

-- Create Invoice table
CREATE TABLE "Invoice" (
  "id" SERIAL PRIMARY KEY,
  "invoiceNumber" TEXT UNIQUE NOT NULL, -- Auto-generated like INV-2025-001
  "clientId" INTEGER NOT NULL REFERENCES "Client"("id"),
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "issuedBy" INTEGER NOT NULL REFERENCES "User"("id"), -- User who issued the invoice
  "amount" FLOAT NOT NULL, -- Total amount before tax
  "taxAmount" FLOAT DEFAULT 0 NOT NULL, -- VAT or other taxes
  "totalAmount" FLOAT NOT NULL, -- Total amount including tax
  "currency" TEXT DEFAULT 'UGX' NOT NULL,
  "status" TEXT DEFAULT 'pending' NOT NULL, -- pending, paid, overdue, cancelled
  "dueDate" TIMESTAMPTZ NOT NULL,
  "issuedDate" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "paidDate" TIMESTAMPTZ,
  "notes" TEXT,
  "terms" TEXT, -- Payment terms
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create InvoiceItem table
CREATE TABLE "InvoiceItem" (
  "id" SERIAL PRIMARY KEY,
  "invoiceId" INTEGER NOT NULL REFERENCES "Invoice"("id") ON DELETE CASCADE,
  "description" TEXT NOT NULL,
  "quantity" INTEGER DEFAULT 1 NOT NULL,
  "unitPrice" FLOAT NOT NULL,
  "totalPrice" FLOAT NOT NULL,
  "testId" INTEGER REFERENCES "Test"("id"),
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Payment table
CREATE TABLE "Payment" (
  "id" SERIAL PRIMARY KEY,
  "invoiceId" INTEGER NOT NULL REFERENCES "Invoice"("id") ON DELETE CASCADE,
  "amount" FLOAT NOT NULL,
  "paymentMethod" TEXT NOT NULL, -- cash, bank_transfer, mobile_money, cheque, card
  "reference" TEXT, -- Payment reference number
  "notes" TEXT,
  "paymentDate" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "receivedBy" INTEGER NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create FinancialTransaction table
CREATE TABLE "FinancialTransaction" (
  "id" SERIAL PRIMARY KEY,
  "type" TEXT NOT NULL, -- invoice, payment, adjustment, refund
  "amount" FLOAT NOT NULL,
  "description" TEXT NOT NULL,
  "reference" TEXT, -- Invoice number, payment reference, etc.
  "clientId" INTEGER REFERENCES "Client"("id"),
  "userId" INTEGER NOT NULL REFERENCES "User"("id"), -- User who created the transaction
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create InventoryItem table
CREATE TABLE "InventoryItem" (
  "id" SERIAL PRIMARY KEY,
  "itemCode" TEXT UNIQUE NOT NULL, -- Auto-generated like EQ-001
  "itemName" TEXT NOT NULL,
  "category" TEXT NOT NULL, -- equipment, supplies, chemicals, glassware, tools
  "description" TEXT,
  "quantity" INTEGER DEFAULT 0 NOT NULL,
  "unit" TEXT NOT NULL,
  "minStock" INTEGER DEFAULT 0 NOT NULL,
  "maxStock" INTEGER,
  "location" TEXT,
  "supplier" TEXT,
  "cost" FLOAT,
  "status" TEXT DEFAULT 'in_stock' NOT NULL, -- in_stock, low_stock, out_of_stock, maintenance, retired
  "expiryDate" TIMESTAMPTZ,
  "calibrationDate" TIMESTAMPTZ,
  "nextCalibration" TIMESTAMPTZ,
  "lastUpdated" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedBy" INTEGER REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Report table
CREATE TABLE "Report" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- daily, weekly, monthly, quarterly, annual, custom
  "category" TEXT NOT NULL, -- samples, tests, finance, performance, quality, compliance
  "description" TEXT,
  "lastGenerated" TIMESTAMPTZ,
  "nextScheduled" TIMESTAMPTZ,
  "status" TEXT DEFAULT 'active' NOT NULL, -- active, inactive, scheduled
  "format" TEXT DEFAULT 'pdf' NOT NULL, -- pdf, excel, csv, html
  "recipients" TEXT, -- JSON string of email addresses
  "createdBy" INTEGER REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create SystemSetting table
CREATE TABLE "SystemSetting" (
  "id" SERIAL PRIMARY KEY,
  "settingKey" TEXT UNIQUE NOT NULL,
  "settingValue" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL, -- general, notifications, security, backup
  "updatedBy" INTEGER REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Log table
CREATE TABLE "Log" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"("id"),
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "actionType" TEXT NOT NULL, -- sample_received, test_submitted, etc.
  "description" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Message table
CREATE TABLE "Message" (
  "id" SERIAL PRIMARY KEY,
  "fromUserId" INTEGER NOT NULL REFERENCES "User"("id"),
  "toUserId" INTEGER NOT NULL REFERENCES "User"("id"),
  "content" TEXT NOT NULL,
  "read" BOOLEAN DEFAULT FALSE NOT NULL,
  "timestamp" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create SampleSet table
CREATE TABLE "SampleSet" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER NOT NULL REFERENCES "Sample"("id"),
  "category" TEXT NOT NULL, -- e.g. Concrete, Pavers, Bricks, Blocks
  "class" TEXT,
  "L" TEXT,
  "W" TEXT,
  "H" TEXT,
  "D" TEXT, -- Diameter for cylinders
  "t" TEXT, -- Thickness for pavers
  "numPerSqm" TEXT, -- Number per sqm for pavers
  "blockType" TEXT, -- solid or hollow
  "holes" JSONB, -- Array of holes/notches for hollow blocks
  "dateOfCast" TIMESTAMPTZ,
  "dateOfTest" TIMESTAMPTZ,
  "age" TEXT,
  "areaOfUse" TEXT,
  "serialNumbers" JSONB, -- Array of serial numbers
  "assignedTests" JSONB, -- Array of test names assigned to this set
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create ConcreteCubeLog table
CREATE TABLE "ConcreteCubeLog" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "sampleSetId" INTEGER,
  "dateReceived" TIMESTAMPTZ,
  "client" TEXT,
  "project" TEXT,
  "castingDate" TIMESTAMPTZ,
  "testingDate" TIMESTAMPTZ,
  "class" TEXT,
  "ageDays" TEXT,
  "areaOfUse" TEXT,
  "sampleSerial" TEXT,
  "lengthMm" TEXT,
  "widthMm" TEXT,
  "heightMm" TEXT,
  "weightKg" TEXT,
  "machineUsed" TEXT,
  "loadkN" TEXT,
  "modeOfFailure" TEXT,
  "temperatureC" TEXT,
  "certificateNo" TEXT,
  "commentRemark" TEXT,
  "technician" TEXT,
  "dateOfIssue" TIMESTAMPTZ,
  "issueId" TEXT,
  "takenBy" TEXT,
  "dateTaken" TIMESTAMPTZ,
  "contact" TEXT,
  "receiptNo" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create BricksBlocksLog table
CREATE TABLE "BricksBlocksLog" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "sampleSetId" INTEGER,
  "dateReceived" TIMESTAMPTZ,
  "client" TEXT,
  "project" TEXT,
  "castingDate" TIMESTAMPTZ,
  "testingDate" TIMESTAMPTZ,
  "ageDays" TEXT,
  "areaOfUse" TEXT,
  "sampleSerial" TEXT,
  "sampleType" TEXT,
  "lengthMm" TEXT,
  "widthMm" TEXT,
  "heightMm" TEXT,
  "holeANo" TEXT,
  "holeALMm" TEXT,
  "holeAWMm" TEXT,
  "holeBNo" TEXT,
  "holeBLMm" TEXT,
  "holeBWMm" TEXT,
  "notchNo" TEXT,
  "notchLMm" TEXT,
  "notchWMm" TEXT,
  "weightKg" TEXT,
  "machineUsed" TEXT,
  "loadkN" TEXT,
  "modeOfFailure" TEXT,
  "temperatureC" TEXT,
  "certificateNo" TEXT,
  "commentRemark" TEXT,
  "technician" TEXT,
  "dateOfIssue" TIMESTAMPTZ,
  "issueId" TEXT,
  "takenBy" TEXT,
  "dateTaken" TIMESTAMPTZ,
  "contact" TEXT,
  "receiptNo" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create PaversLog table
CREATE TABLE "PaversLog" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "sampleSetId" INTEGER,
  "dateReceived" TIMESTAMPTZ,
  "client" TEXT,
  "project" TEXT,
  "castingDate" TIMESTAMPTZ,
  "testingDate" TIMESTAMPTZ,
  "ageDays" TEXT,
  "areaOfUse" TEXT,
  "sampleSerial" TEXT,
  "paverType" TEXT,
  "lengthMm" TEXT,
  "widthMm" TEXT,
  "heightMm" TEXT,
  "paversPerM2" TEXT,
  "areaMm2" TEXT,
  "weightKg" TEXT,
  "machineUsed" TEXT,
  "loadkN" TEXT,
  "modeOfFailure" TEXT,
  "temperatureC" TEXT,
  "certificateNo" TEXT,
  "commentRemark" TEXT,
  "technician" TEXT,
  "dateOfIssue" TIMESTAMPTZ,
  "issueId" TEXT,
  "takenBy" TEXT,
  "dateTaken" TIMESTAMPTZ,
  "contact" TEXT,
  "receiptNo" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create ConcreteCylinderLog table
CREATE TABLE "ConcreteCylinderLog" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "sampleSetId" INTEGER,
  "castingDate" TIMESTAMPTZ,
  "testingDate" TIMESTAMPTZ,
  "class" TEXT,
  "ageDays" TEXT,
  "areaOfUse" TEXT,
  "sampleSerial" TEXT,
  "diameterMm" TEXT,
  "heightMm" TEXT,
  "weightKg" TEXT,
  "machineUsed" TEXT,
  "loadkN" TEXT,
  "modeOfFailure" TEXT,
  "temperatureC" TEXT,
  "certificateNo" TEXT,
  "commentRemark" TEXT,
  "technician" TEXT,
  "dateOfIssue" TIMESTAMPTZ,
  "issueId" TEXT,
  "takenBy" TEXT,
  "dateTaken" TIMESTAMPTZ,
  "contact" TEXT,
  "receiptNo" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create WaterAbsorptionLog table
CREATE TABLE "WaterAbsorptionLog" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "sampleSetId" INTEGER,
  "dateOfReceipt" TIMESTAMPTZ,
  "client" TEXT,
  "project" TEXT,
  "castingDate" TIMESTAMPTZ,
  "testingDate" TIMESTAMPTZ,
  "ageDays" TEXT,
  "areaOfUse" TEXT,
  "sampleSerial" TEXT,
  "sampleType" TEXT,
  "lengthMm" TEXT,
  "widthMm" TEXT,
  "heightMm" TEXT,
  "ovenDriedWeightKg" TEXT,
  "weightAfterSoakingKg" TEXT,
  "waterWeightKg" TEXT,
  "waterAbsorptionPct" TEXT,
  "certificateNo" TEXT,
  "commentRemark" TEXT,
  "technician" TEXT,
  "dateOfIssue" TIMESTAMPTZ,
  "issueId" TEXT,
  "takenBy" TEXT,
  "dateTaken" TIMESTAMPTZ,
  "contact" TEXT,
  "receiptNo" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create ProjectsLog table
CREATE TABLE "ProjectsLog" (
  "id" SERIAL PRIMARY KEY,
  "sampleId" INTEGER REFERENCES "Sample"("id"),
  "sampleSetId" INTEGER,
  "date" TIMESTAMPTZ,
  "bigProjectId" TEXT,
  "smallProjectId" TEXT,
  "client" TEXT,
  "project" TEXT,
  "engineerInCharge" TEXT,
  "fieldTestsDetail" TEXT,
  "technicianInCharge" TEXT,
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "remarks" TEXT,
  "labTestDescription" TEXT,
  "agreedDelivery" TIMESTAMPTZ,
  "actualDelivery" TIMESTAMPTZ,
  "signature" TEXT,
  "acknowledgement" TEXT,
  "reportIssuedBy" TEXT,
  "reportDeliveredTo" TEXT,
  "contact" TEXT,
  "dateTime" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updatedAt
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'Role', 'User', 'Client', 'Project', 'Test', 'Sample',
      'SampleTest', 'TestResult', 'Invoice', 'InvoiceItem',
      'Payment', 'ClientAccount', 'FinancialTransaction', 
      'InventoryItem', 'Report', 'SystemSetting',
      'SampleSet', 'ConcreteCubeLog', 'BricksBlocksLog',
      'PaversLog', 'ConcreteCylinderLog', 'WaterAbsorptionLog',
      'ProjectsLog'
    )
  LOOP
    EXECUTE format('
      CREATE TRIGGER trigger_update_timestamp
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();', t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security policies
-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sample" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SampleTest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (these should be refined based on your specific needs)
-- Allow authenticated users to view all data but restrict modifications
CREATE POLICY "Allow all users to view users" ON "User" 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all users to view clients" ON "Client" 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all users to view samples" ON "Sample" 
  FOR SELECT USING (auth.role() = 'authenticated');

-- More restrictive policies can be added based on roles and permissions
-- For example, only allow users to update samples they are assigned to
CREATE POLICY "Allow users to update assigned samples" ON "Sample" 
  FOR UPDATE USING (auth.role() = 'authenticated' AND "assignedTo" = auth.uid()::int);

-- These policies should be expanded based on your application's permission model