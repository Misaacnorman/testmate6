const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClients() {
  try {
    const clients = await prisma.client.findMany();
    console.log('Clients in database:');
    clients.forEach(client => {
      console.log(`ID: ${client.id}, Name: ${client.name}, Email: ${client.email}`);
    });
    console.log(`Total clients: ${clients.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClients(); 