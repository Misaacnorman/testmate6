const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // First, check if Admin role exists
    const adminRole = await prisma.role.findFirst({ 
      where: { name: 'Admin' } 
    });
    
    if (!adminRole) {
      console.error('Admin role not found. Creating roles first...');
      // Create basic roles if they don't exist
      await prisma.role.createMany({
        data: [
          { name: 'Super User', description: 'Full system access', permissions: '[]', isSystemRole: true },
          { name: 'Admin', description: 'System administrator', permissions: '[]', isSystemRole: true },
          { name: 'Materials Technician', description: 'Handles material tests', permissions: '[]', isSystemRole: false },
          { name: 'Materials Engineer', description: 'Supervises material tests', permissions: '[]', isSystemRole: false },
          { name: 'Finance Department', description: 'Manages finance and billing', permissions: '[]', isSystemRole: false },
          { name: 'Business Development Manager', description: 'Handles business development', permissions: '[]', isSystemRole: false },
          { name: 'Client', description: 'External client', permissions: '[]', isSystemRole: false }
        ],
        skipDuplicates: true
      });
      
      const newAdminRole = await prisma.role.findFirst({ 
        where: { name: 'Admin' } 
      });
      
      if (!newAdminRole) {
        console.error('Failed to create Admin role');
        return;
      }
    }
    
    const finalAdminRole = adminRole || await prisma.role.findFirst({ where: { name: 'Admin' } });
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@testmate.com' }
    });
    
    if (existingUser) {
      console.log('User already exists. Updating...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@testmate.com' },
        data: {
          password: hashedPassword,
          status: 'active',
          roleId: finalAdminRole.id
        }
      });
      console.log('User updated successfully!');
    } else {
      console.log('Creating new admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'System Administrator',
          email: 'admin@testmate.com',
          username: 'admin@testmate.com',
          password: hashedPassword,
          status: 'active',
          roleId: finalAdminRole.id,
          department: 'Administration'
        }
      });
      console.log('Admin user created successfully!');
    }
    
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Email: admin@testmate.com');
    console.log('Password: admin123');
    console.log('========================\n');
    
    // Verify the user was created
    const user = await prisma.user.findUnique({
      where: { email: 'admin@testmate.com' },
      include: { role: true }
    });
    
    console.log('User verification:', {
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role.name
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 