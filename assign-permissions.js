const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignPermissions() {
  try {
    console.log('Assigning permissions to roles...');

    // Define permission mappings for each role level
    const rolePermissions = {
      'Super User': [
        'sample.receive', 'test.perform', 'test.submit', 'test.review', 'test.assign',
        'test.edit_submission', 'billing.proceed', 'invoice.issue', 'finance.view',
        'user.manage', 'role.manage', 'project.assign', 'report.extract',
        'compatibility.edit', 'accounting.access'
      ],
      'Admin': [
        'sample.receive', 'test.perform', 'test.submit', 'test.review', 'test.assign',
        'test.edit_submission', 'billing.proceed', 'invoice.issue', 'finance.view',
        'user.manage', 'role.manage', 'project.assign', 'report.extract'
      ],
      'Materials Technician': [
        'sample.receive', 'test.perform', 'test.submit'
      ],
      'Materials Engineer': [
        'sample.receive', 'test.perform', 'test.submit', 'test.review', 'test.assign',
        'test.edit_submission', 'project.assign'
      ],
      'Finance Department': [
        'finance.view', 'billing.proceed', 'invoice.issue', 'accounting.access'
      ],
      'Business Development Manager': [
        'sample.receive', 'project.assign', 'finance.view', 'report.extract'
      ],
      'Client': [
        'sample.receive'
      ]
    };

    // Update each role with its permissions
    for (const [roleName, permissions] of Object.entries(rolePermissions)) {
      console.log(`Updating ${roleName} with ${permissions.length} permissions...`);
      
      await prisma.role.update({
        where: { name: roleName },
        data: {
          permissions: JSON.stringify(permissions)
        }
      });
    }

    // Explicitly reset Admin role's permissions to fix any malformed JSON
    await prisma.role.update({
      where: { name: 'Admin' },
      data: {
        permissions: JSON.stringify(rolePermissions['Admin'])
      }
    });

    console.log('\nPermissions assigned successfully!');
    
    // Display the updated roles and their permissions
    console.log('\n=== ROLE PERMISSIONS SUMMARY ===');
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });
    
    for (const role of roles) {
      let permissions = [];
      try {
        permissions = JSON.parse(role.permissions || '[]');
      } catch (e) {
        console.log(`Warning: Could not parse permissions for ${role.name}: ${role.permissions}`);
        permissions = [];
      }
      
      console.log(`\n${role.name} (Level ${getRoleLevel(role.name)}):`);
      permissions.forEach(perm => console.log(`  - ${perm}`));
    }

  } catch (error) {
    console.error('Error assigning permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getRoleLevel(roleName) {
  const levelMap = {
    'Super User': 'All',
    'Admin': 1,
    'Materials Technician': 2,
    'Materials Engineer': 3,
    'Finance Department': 4,
    'Business Development Manager': 5,
    'Client': 'External'
  };
  return levelMap[roleName] || 'Unknown';
}

assignPermissions(); 