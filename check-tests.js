const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTests() {
  try {
    const tests = await prisma.test.findMany();
    console.log('Material tests count:', tests.length);
    if (tests.length > 0) {
      console.log('Sample test:', tests[0]);
    } else {
      console.log('No material tests found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTests(); 