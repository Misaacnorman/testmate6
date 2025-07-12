const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the controller function directly
const { receiveSamples } = require('./src/controllers/sample.controller');

async function testLogCreationDirect() {
  try {
    console.log('=== TESTING LOG CREATION DIRECTLY ===');
    
    // Mock request and response objects
    const mockReq = {
      body: {
        clientName: "Test Client Direct",
        projectTitle: "Test Project Direct",
        receivedDate: "2025-01-07",
        receivedBy: "Test User",
        deliveredBy: "Test Delivery",
        deliveryContact: "1234567890",1
        modeOfTransmit: "Email",
        receiptTime: "10:00",
        sets: [
          {
            category: "CONCRETE",
            class: "30",
            L: "150",
            W: "150", 
            H: "150",
            areaOfUse: "Test Area",
            serialNumbers: ["1", "2", "3"],
            dateOfCast: "2025-01-01",
            dateOfTest: "2025-01-07",
            age: "7"
          },
          {
            category: "BLOCKS",
            class: "N/A",
            L: "400",
            W: "200",
            H: "200",
            areaOfUse: "Walling",
            serialNumbers: ["1", "2"],
            blockType: "solid",
            dateOfCast: "2025-01-01",
            dateOfTest: "2025-01-07",
            age: "7"
          }
        ],
        tests: [
          { materialTest: "Compressive Strength of Concrete Cubes" },
          { materialTest: "Compressive Strength of Blocks" }
        ]
      },
      user: { id: 1 } // Mock authenticated user
    };
    
    const mockRes = {
      status: function(code) {
        console.log('Response status:', code);
        return this;
      },
      json: function(data) {
        console.log('Response data:', data);
        return this;
      }
    };
    
    console.log('Calling receiveSamples function directly...');
    await receiveSamples(mockReq, mockRes);
    
    // Check if logs were created
    console.log('\nChecking log creation...');
    
    const concreteCubeLogs = await prisma.concreteCubeLog.findMany({
      where: {
        client: "Test Client Direct"
      }
    });
    console.log('ConcreteCubeLog entries for test:', concreteCubeLogs.length);
    
    const bricksBlocksLogs = await prisma.bricksBlocksLog.findMany({
      where: {
        client: "Test Client Direct"
      }
    });
    console.log('BricksBlocksLog entries for test:', bricksBlocksLogs.length);
    
    if (concreteCubeLogs.length > 0) {
      console.log('Sample ConcreteCubeLog entry:', concreteCubeLogs[0]);
    }
    
    if (bricksBlocksLogs.length > 0) {
      console.log('Sample BricksBlocksLog entry:', bricksBlocksLogs[0]);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogCreationDirect(); 