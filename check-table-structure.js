const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTableStructure() {
  try {
    console.log('Checking Test table structure...');
    
    const result = await prisma.$queryRaw`SHOW CREATE TABLE Test`;
    console.log('Test table structure:');
    console.log(result);
    
    // Also check the column information
    const columns = await prisma.$queryRaw`DESCRIBE Test`;
    console.log('\nTest table columns:');
    console.log(columns);
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableStructure(); 