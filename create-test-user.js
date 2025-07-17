const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Find the Admin role
    const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
    if (!adminRole) {
      console.error('Admin role not found.');
      process.exit(1);
    }

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: 'admin@testmate.com' } 
    });

    if (existingUser) {
      console.log('Test user already exists. Updating password...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@testmate.com' },
        data: { 
          password: hashedPassword,
          status: 'active',
          roleId: adminRole.id
        }
      });
      console.log('Test user updated successfully!');
    } else {
      // Create test user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'Test Admin',
          email: 'admin@testmate.com',
          username: 'admin@testmate.com',
          password: hashedPassword,
          status: 'active',
          roleId: adminRole.id,
        }
      });
      console.log('Test user created successfully!');
    }

    console.log('\nLogin credentials:');
    console.log('Email: admin@testmate.com');
    console.log('Password: admin123');
    console.log('\nYou can now log in with these credentials.');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 