const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

// Test the complete flow with test assignments
async function testFrontendIntegration() {
  console.log('Testing frontend-backend integration for test assignments...\n');
  
  const testData = {
    clientName: 'Frontend Test Client',
    clientAddress: 'Test Address',
    clientContact: '123456789',
    projectTitle: 'Frontend Integration Test',
    sampleStatus: 'Test Status',
    receivedDate: '2025-01-06',
    receivedBy: 'Test User',
    receiptTime: '10:00 AM',
    deliveredBy: 'Delivery Person',
    deliveryContact: '987654321',
    modeOfTransmit: 'Email',
    tests: [
      { materialTest: 'Compressive Strength Test' },
      { materialTest: 'Water Absorption Test' }
    ],
    sets: [
      {
        category: 'CONCRETE',
        class: 'C25',
        L: '150',
        W: '150',
        H: '150',
        dateOfCast: '2025-01-01',
        dateOfTest: '2025-01-06',
        age: '5',
        areaOfUse: 'Foundation',
        serialNumbers: ['001', '002', '003'],
        assignedTests: [] // Default log (ConcreteCubeLog)
      },
      {
        category: 'CONCRETE',
        class: 'C25',
        L: '150',
        W: '150',
        H: '150',
        dateOfCast: '2025-01-01',
        dateOfTest: '2025-01-06',
        age: '5',
        areaOfUse: 'Foundation',
        serialNumbers: ['004', '005'],
        assignedTests: ['Water Absorption Test'] // Water Absorption log
      }
    ]
  };
  
  try {
    console.log('Sending test data to /api/samples/receive...');
    console.log('Scenario: CONCRETE with Water Absorption + Compressive Strength');
    console.log('Set 1: No assignment → ConcreteCubeLog (default)');
    console.log('Set 2: Water Absorption assigned → WaterAbsorptionLog');
    
    const response = await axios.post(`${API_BASE}/samples/receive`, testData);
    
    if (response.status === 201) {
      console.log('✅ Sample registration successful');
      console.log(`Sample ID: ${response.data.sample.id}`);
      console.log(`Sample Code: ${response.data.sample.sampleCode}`);
      
      // Verify logs were created correctly
      console.log('\n--- Expected Log Entries ---');
      console.log('Set 1 (No Water Absorption) → ConcreteCubeLog');
      console.log('Set 2 (Water Absorption) → WaterAbsorptionLog');
      
      console.log('\nTo verify the logs, run:');
      console.log(`node verify-logs.js ${response.data.sample.id}`);
      
    } else {
      console.log('❌ Sample registration failed');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Error during test:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run the test
testFrontendIntegration().catch(console.error); 