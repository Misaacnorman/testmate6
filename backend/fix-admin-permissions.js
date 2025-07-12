const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminPermissions() {
  try {
    const adminPerms = [
      'sample.receive', 'test.perform', 'test.submit', 'test.review', 'test.assign',
      'test.edit_submission', 'billing.proceed', 'invoice.issue', 'finance.view',
      'user.manage', 'role.manage', 'project.assign', 'report.extract'
    ];
    await prisma.role.update({
      where: { name: 'Admin' },
      data: { permissions: JSON.stringify(adminPerms) }
    });
    console.log('Admin role permissions reset successfully!');
  } catch (e) {
    console.error('Failed to reset Admin permissions:', e);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPermissions(); 