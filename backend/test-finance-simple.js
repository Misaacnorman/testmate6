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

async function testFinanceEndpoints() {
  console.log('🧪 Testing Finance Module Endpoints...\n');

  try {
    // Check existing roles
    console.log('1. Checking existing roles...');
    const rolesResponse = await makeRequest('GET', '/api/roles');
    console.log('Roles response:', rolesResponse);
    console.log('');

    // Check existing users
    console.log('2. Checking existing users...');
    const usersResponse = await makeRequest('GET', '/api/users');
    console.log('Users response:', usersResponse);
    console.log('');

    // Test finance endpoints with existing data
    console.log('3. Testing get all invoices...');
    const getInvoicesResponse = await makeRequest('GET', '/api/finance/invoices');
    console.log('Get invoices response:', getInvoicesResponse);
    console.log('');

    console.log('4. Testing get all payments...');
    const getPaymentsResponse = await makeRequest('GET', '/api/finance/payments');
    console.log('Get payments response:', getPaymentsResponse);
    console.log('');

    console.log('5. Testing get client accounts...');
    const getAccountsResponse = await makeRequest('GET', '/api/finance/accounts');
    console.log('Get client accounts response:', getAccountsResponse);
    console.log('');

    console.log('6. Testing revenue report...');
    const revenueResponse = await makeRequest('GET', '/api/finance/reports/revenue');
    console.log('Revenue report response:', revenueResponse);
    console.log('');

    console.log('7. Testing outstanding report...');
    const outstandingResponse = await makeRequest('GET', '/api/finance/reports/outstanding');
    console.log('Outstanding report response:', outstandingResponse);
    console.log('');

    console.log('8. Testing cash flow report...');
    const cashFlowResponse = await makeRequest('GET', '/api/finance/reports/cashflow');
    console.log('Cash flow report response:', cashFlowResponse);
    console.log('');

    // Try to create an invoice if we have users
    if (usersResponse.data && usersResponse.data.length > 0) {
      console.log('9. Testing invoice creation with existing user...');
      const invoiceData = {
        clientId: usersResponse.data[0].id,
        items: [
          {
            description: "Concrete Compressive Strength Test",
            quantity: 3,
            unitPrice: 50000,
            testId: 1
          }
        ],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Test invoice for finance module",
        terms: "Net 30",
        issuedBy: usersResponse.data[0].id
      };
      const invoiceResponse = await makeRequest('POST', '/api/finance/invoices', invoiceData);
      console.log('Invoice creation response:', invoiceResponse);
      console.log('');
    }

    console.log('✅ Finance endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error testing finance endpoints:', error);
  }
}

testFinanceEndpoints(); 