const http = require('http');

function testWithMockToken() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      clientName: "Test Client",
      clientAddress: "Test Address", 
      clientContact: "Test Contact",
      projectTitle: "Test Project",
      sampleStatus: "Test Status",
      receivedDate: "2025-07-04",
      receivedBy: "Test User",
      receiptTime: "10:00",
      deliveredBy: "Test Delivery",
      deliveryContact: "Test Contact",
      modeOfTransmit: "Email",
      tests: [{ materialTest: "Test Test" }]
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/samples/receive',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': 'Bearer mock-token-for-testing'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`With mock token: ${res.statusCode} ${res.statusCode === 201 ? 'OK' : 'FAILED'}`);
        if (data) {
          console.log('Response:', data);
        }
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`With mock token: ERROR - ${err.message}`);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

async function testTokenAuth() {
  console.log('Testing authentication with mock token...');
  
  try {
    await testWithMockToken();
    console.log('Token test completed.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTokenAuth(); 