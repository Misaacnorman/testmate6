const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSampleTests() {
  try {
    console.log('Deleting sample material tests...');
    
    // Delete all tests that were created by the seed script
    const sampleTestCodes = [
      'CON-001', 'CON-002', 'CON-003',
      'STEEL-001', 'STEEL-002',
      'SOIL-001', 'SOIL-002',
      'AGG-001', 'AGG-002',
      'PAVER-001', 'PAVER-002',
      'BRICK-001', 'BRICK-002',
      'BLOCK-001', 'BLOCK-002',
      'CYL-001', 'CYL-002'
    ];
    
    const deleteResult = await prisma.test.deleteMany({
      where: {
        code: {
          in: sampleTestCodes
        }
      }
    });
    
    console.log(`Deleted ${deleteResult.count} sample material tests`);
    
    // Check remaining tests
    const remainingCount = await prisma.test.count();
    console.log(`Remaining material tests in database: ${remainingCount}`);
    
  } catch (error) {
    console.error('Error deleting sample tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSampleTests(); 