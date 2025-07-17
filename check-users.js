const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    });
    
    console.log('\nUsers found:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Status: ${user.status}, Role: ${user.role?.name || 'No role'}`);
    });
    
    if (users.length === 0) {
      console.log('\nNo users found in database!');
      return;
    }
    
    // Test login with admin@testmate.com
    console.log('\nTesting login with admin@testmate.com...');
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@testmate.com' }
    });
    
    if (!testUser) {
      console.log('Test user not found!');
      return;
    }
    
    console.log('Test user found:', {
      id: testUser.id,
      email: testUser.email,
      status: testUser.status,
      roleId: testUser.roleId
    });
    
    // Test password
    const password = 'admin123';
    const isValid = await bcrypt.compare(password, testUser.password);
    console.log('Password validation:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 