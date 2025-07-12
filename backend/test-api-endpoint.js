const axios = require('axios');

async function testApiEndpoint() {
  try {
    console.log('=== TESTING API ENDPOINT ===');
    
    // Test data for sample receipt
    const testData = {
      clientName: "Test Client",
      projectTitle: "Test Project",
      receivedDate: "2025-01-07",
      receivedBy: "Test User",
      deliveredBy: "Test Delivery",
      deliveryContact: "1234567890",
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
    };
    
    console.log('Sending test data to API...');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:4000/api/samples/receive', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testApiEndpoint(); 