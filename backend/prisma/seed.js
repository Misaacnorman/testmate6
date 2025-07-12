// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // --- Permissions ---
  const permissions = [
    { key: 'sample.receive', description: 'Can log in to receive a sample' },
    { key: 'test.perform', description: 'Can perform tests' },
    { key: 'test.submit', description: 'Can submit test results' },
    { key: 'test.review', description: 'Can review results and give comment' },
    { key: 'test.assign', description: 'Can assign work to other users' },
    { key: 'test.edit_submission', description: 'Can edit test submissions' },
    { key: 'billing.proceed', description: 'Can proceed to billing' },
    { key: 'invoice.issue', description: 'Can issue receipts/invoices for payment' },
    { key: 'finance.view', description: 'Can extract statement of accounts and access financial records' },
    { key: 'user.manage', description: 'Can manage users' },
    { key: 'role.manage', description: 'Can manage roles and permissions' },
    { key: 'project.assign', description: 'Can assign work to projects' },
    { key: 'report.extract', description: 'Can extract reports' },
    { key: 'compatibility.edit', description: 'Can edit for compatibility (Super User)' },
    { key: 'accounting.access', description: 'Access to department of accounts' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }

  const roles = [
    { name: 'Super User', description: 'Full system access', permissions: JSON.stringify([]), isSystemRole: true },
    { name: 'Admin', description: 'System administrator', permissions: JSON.stringify([]), isSystemRole: true },
    { name: 'Materials Technician', description: 'Handles material tests', permissions: JSON.stringify([]), isSystemRole: false },
    { name: 'Materials Engineer', description: 'Supervises material tests', permissions: JSON.stringify([]), isSystemRole: false },
    { name: 'Finance Department', description: 'Manages finance and billing', permissions: JSON.stringify([]), isSystemRole: false },
    { name: 'Business Development Manager', description: 'Handles business development', permissions: JSON.stringify([]), isSystemRole: false },
    { name: 'Client', description: 'External client', permissions: JSON.stringify([]), isSystemRole: false },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('Seeded permissions and roles.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); }); 