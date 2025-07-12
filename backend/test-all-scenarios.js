const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

// Test all scenarios
async function testAllScenarios() {
  console.log('Testing all test assignment scenarios...\n');
  
  const scenarios = [
    {
      name: 'Scenario 1: No Water Absorption',
      description: 'Only Compressive Strength selected - all sets go to default log',
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
        tests: [{ materialTest: 'Compressive Strength Test' }],
        sets: [
          {
            category: 'CONCRETE',
            class: 'C25',
            L: '150', W: '150', H: '150',
            dateOfCast: '2025-01-01', dateOfTest: '2025-01-06', age: '5',
            areaOfUse: 'Foundation', serialNumbers: ['001', '002'],
            assignedTests: []
          }
        ]
      },
      expectedLogs: ['ConcreteCubeLog']
    },
    {
      name: 'Scenario 2: Only Water Absorption',
      description: 'Only Water Absorption selected - all sets go to WaterAbsorptionLog',
      data: {
        clientName: 'Test Client 2',
        clientAddress: 'Test Address',
        clientContact: '123456789',
        projectTitle: 'Test Project 2',
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
            category: 'CONCRETE',
            class: 'C25',
            L: '150', W: '150', H: '150',
            dateOfCast: '2025-01-01', dateOfTest: '2025-01-06', age: '5',
            areaOfUse: 'Foundation', serialNumbers: ['001', '002'],
            assignedTests: []
          }
        ]
      },
      expectedLogs: ['WaterAbsorptionLog']
    },
    {
      name: 'Scenario 3: Water Absorption + Other Test',
      description: 'Water Absorption + Compressive Strength - checkboxes needed',
      data: {
        clientName: 'Test Client 3',
        clientAddress: 'Test Address',
        clientContact: '123456789',
        projectTitle: 'Test Project 3',
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
            L: '150', W: '150', H: '150',
            dateOfCast: '2025-01-01', dateOfTest: '2025-01-06', age: '5',
            areaOfUse: 'Foundation', serialNumbers: ['001', '002'],
            assignedTests: [] // Default log
          },
          {
            category: 'CONCRETE',
            class: 'C25',
            L: '150', W: '150', H: '150',
            dateOfCast: '2025-01-01', dateOfTest: '2025-01-06', age: '5',
            areaOfUse: 'Foundation', serialNumbers: ['003'],
            assignedTests: ['Water Absorption Test'] // Water Absorption log
          }
        ]
      },
      expectedLogs: ['ConcreteCubeLog', 'WaterAbsorptionLog']
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);
    console.log(`Description: ${scenario.description}`);
    console.log(`Expected Logs: ${scenario.expectedLogs.join(', ')}`);
    
    try {
      const response = await axios.post(`${API_BASE}/samples/receive`, scenario.data);
      
      if (response.status === 201) {
        console.log('✅ Success');
        console.log(`Sample ID: ${response.data.sample.id}`);
        console.log(`Sample Code: ${response.data.sample.sampleCode}`);
        
        console.log('To verify logs, run:');
        console.log(`node verify-logs.js ${response.data.sample.id}`);
      } else {
        console.log('❌ Failed');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
      }
    } catch (error) {
      console.log('❌ Error:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
    console.log('---');
  }
  
  console.log('\n--- All scenarios tested ---');
}

// Run the tests
testAllScenarios().catch(console.error); 