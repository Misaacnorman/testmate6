const http = require('http');

function testSamplesReceiveEndpoint() {
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
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Samples/receive endpoint: ${res.statusCode} ${res.statusCode === 201 ? 'OK' : 'FAILED'}`);
        if (data) {
          console.log('Response:', data);
        }
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`Samples/receive endpoint: ERROR - ${err.message}`);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

async function testEndpoint() {
  console.log('Testing /api/samples/receive endpoint...');
  
  try {
    await testSamplesReceiveEndpoint();
    console.log('Test completed.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEndpoint(); 