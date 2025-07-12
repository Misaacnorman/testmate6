const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testInvoiceError() {
  console.log('🔍 Testing Invoice Creation Error...\n');

  try {
    // Get existing users
    const usersResponse = await makeRequest('GET', '/api/users');
    console.log('Users found:', usersResponse.data.length);

    if (usersResponse.data.length === 0) {
      console.log('❌ No users found.');
      return;
    }

    const clientId = usersResponse.data[0].id;
    const issuerId = usersResponse.data.length > 1 ? usersResponse.data[1].id : usersResponse.data[0].id;

    console.log(`Using User ID ${clientId} as client and User ID ${issuerId} as issuer`);
    console.log('');

    // Test invoice creation with minimal data
    const invoiceData = {
      clientId: clientId,
      items: [
        {
          description: "Test Item",
          quantity: 1,
          unitPrice: 1000,
          testId: null
        }
      ],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Test invoice",
      terms: "Net 30",
      issuedBy: issuerId
    };

    console.log('Invoice data:', JSON.stringify(invoiceData, null, 2));
    console.log('');

    const invoiceResponse = await makeRequest('POST', '/api/finance/invoices', invoiceData);
    console.log('Invoice creation response:', invoiceResponse);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testInvoiceError(); 