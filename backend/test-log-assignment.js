const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test scenarios
const testScenarios = [
  {
    name: 'Single Water Absorption Test',
    data: {
      clientName: 'Test Client 1',
      clientAddress: 'Test Address',
      clientContact: '123456789',
      projectTitle: 'Test Project 1',
      sampleStatus: 'Test Status',
      receivedDate: '2025-01-06',
      receivedBy: 'Test User',
      receiptTime: '10:00 AM',
      deliveredBy: 'Delivery Person',
      deliveryContact: '987654321',
      modeOfTransmit: 'Email',
      tests: [{ materialTest: 'Water Absorption Test' }],
      sets: [
        {
          category: 'Concrete',
          class: 'C25',
          L: '150',
          W: '150',
          H: '150',
          assignedTests: ['Water Absorption Test']
        }
      ]
    },
    expectedLogs: ['WaterAbsorptionLog']
  },
  {
    name: 'Multiple Tests with Assignments',
    data: {
      clientName: 'Test Client 2',
      clientAddress: 'Test Address 2',
      clientContact: '123456789',
      projectTitle: 'Test Project 2',
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
          category: 'Concrete',
          class: 'C25',
          L: '150',
          W: '150',
          H: '150',
          assignedTests: ['Compressive Strength Test']
        },
        {
          category: 'Concrete',
          class: 'C25',
          L: '150',
          W: '150',
          H: '150',
          assignedTests: ['Water Absorption Test']
        }
      ]
    },
    expectedLogs: ['ConcreteCubeLog', 'WaterAbsorptionLog']
  },
  {
    name: 'Default Category-Based Logging',
    data: {
      clientName: 'Test Client 3',
      clientAddress: 'Test Address 3',
      clientContact: '123456789',
      projectTitle: 'Test Project 3',
      sampleStatus: 'Test Status',
      receivedDate: '2025-01-06',
      receivedBy: 'Test User',
      receiptTime: '10:00 AM',
      deliveredBy: 'Delivery Person',
      deliveryContact: '987654321',
      modeOfTransmit: 'Email',
      tests: [{ materialTest: 'Compressive Strength Test' }],
      sets: [
        {
          category: 'Pavers',
          class: 'P1',
          L: '200',
          W: '100',
          t: '60',
          numPerSqm: '50',
          assignedTests: []
        }
      ]
    },
    expectedLogs: ['PaversLog']
  }
];

async function testLogAssignment() {
  console.log('Testing log assignment logic...\n');
  
  for (const scenario of testScenarios) {
    console.log(`\n--- Testing: ${scenario.name} ---`);
    
    try {
      const response = await axios.post(`${API_BASE}/samples/receive`, scenario.data);
      
      if (response.status === 201) {
        console.log('✅ Sample registration successful');
        console.log(`Sample ID: ${response.data.sample.id}`);
        console.log(`Sample Code: ${response.data.sample.sampleCode}`);
        console.log(`Expected Logs: ${scenario.expectedLogs.join(', ')}`);
        
        // TODO: Add verification that logs were created in the correct tables
        // This would require querying the database to check which log entries were created
        
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
  
  console.log('\n--- Test completed ---');
}

// Run the test
testLogAssignment().catch(console.error); 