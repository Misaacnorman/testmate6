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
    // Test 1: Create a test user first (for client)
    console.log('1. Testing user creation for client...');
    const userData = {
      name: "Test Finance Client",
      email: "finance@test.com",
      password: "password123",
      roleId: 1, // Assuming role ID 1 exists
      contact: "+256123456789",
      address: "123 Finance Street, Kampala"
    };
    const userResponse = await makeRequest('POST', '/api/users', userData);
    console.log('User creation response:', userResponse);
    console.log('');

    // Test 2: Create a test user for invoice issuer
    console.log('2. Testing user creation for invoice issuer...');
    const issuerData = {
      name: "Invoice Issuer",
      email: "issuer@test.com",
      password: "password123",
      roleId: 1,
      contact: "+256123456788",
      address: "456 Issuer Street, Kampala"
    };
    const issuerResponse = await makeRequest('POST', '/api/users', issuerData);
    console.log('Issuer creation response:', issuerResponse);
    console.log('');

    // Test 3: Create an invoice
    console.log('3. Testing invoice creation...');
    const invoiceData = {
      clientId: 1, // Assuming user ID 1 exists
      items: [
        {
          description: "Concrete Compressive Strength Test",
          quantity: 3,
          unitPrice: 50000,
          testId: 1
        },
        {
          description: "Slump Test",
          quantity: 1,
          unitPrice: 25000,
          testId: 2
        }
      ],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      notes: "Test invoice for finance module",
      terms: "Net 30",
      issuedBy: 2 // Assuming user ID 2 exists
    };
    const invoiceResponse = await makeRequest('POST', '/api/finance/invoices', invoiceData);
    console.log('Invoice creation response:', invoiceResponse);
    console.log('');

    // Test 4: Get all invoices
    console.log('4. Testing get all invoices...');
    const getInvoicesResponse = await makeRequest('GET', '/api/finance/invoices');
    console.log('Get invoices response:', getInvoicesResponse);
    console.log('');

    // Test 5: Get single invoice (if created successfully)
    if (invoiceResponse.status === 201 || invoiceResponse.status === 200) {
      console.log('5. Testing get single invoice...');
      const getInvoiceResponse = await makeRequest('GET', '/api/finance/invoices/1');
      console.log('Get single invoice response:', getInvoiceResponse);
      console.log('');
    }

    // Test 6: Create a payment (if invoice exists)
    if (invoiceResponse.status === 201 || invoiceResponse.status === 200) {
      console.log('6. Testing payment creation...');
      const paymentData = {
        invoiceId: 1,
        amount: 100000,
        paymentMethod: "bank_transfer",
        reference: "REF-2025-001",
        notes: "Partial payment for test invoice",
        receivedBy: 2
      };
      const paymentResponse = await makeRequest('POST', '/api/finance/payments', paymentData);
      console.log('Payment creation response:', paymentResponse);
      console.log('');
    }

    // Test 7: Get all payments
    console.log('7. Testing get all payments...');
    const getPaymentsResponse = await makeRequest('GET', '/api/finance/payments');
    console.log('Get payments response:', getPaymentsResponse);
    console.log('');

    // Test 8: Get single payment (if created successfully)
    if (getPaymentsResponse.data && getPaymentsResponse.data.length > 0) {
      console.log('8. Testing get single payment...');
      const getPaymentResponse = await makeRequest('GET', '/api/finance/payments/1');
      console.log('Get single payment response:', getPaymentResponse);
      console.log('');
    }

    // Test 9: Get client accounts
    console.log('9. Testing get client accounts...');
    const getAccountsResponse = await makeRequest('GET', '/api/finance/accounts');
    console.log('Get client accounts response:', getAccountsResponse);
    console.log('');

    // Test 10: Get revenue report
    console.log('10. Testing revenue report...');
    const revenueResponse = await makeRequest('GET', '/api/finance/reports/revenue');
    console.log('Revenue report response:', revenueResponse);
    console.log('');

    // Test 11: Get outstanding report
    console.log('11. Testing outstanding report...');
    const outstandingResponse = await makeRequest('GET', '/api/finance/reports/outstanding');
    console.log('Outstanding report response:', outstandingResponse);
    console.log('');

    // Test 12: Get cash flow report
    console.log('12. Testing cash flow report...');
    const cashFlowResponse = await makeRequest('GET', '/api/finance/reports/cashflow');
    console.log('Cash flow report response:', cashFlowResponse);
    console.log('');

    // Test 13: Update invoice status (if invoice exists)
    if (invoiceResponse.status === 201 || invoiceResponse.status === 200) {
      console.log('13. Testing invoice update...');
      const updateInvoiceData = {
        status: "paid",
        notes: "Updated via API test"
      };
      const updateInvoiceResponse = await makeRequest('PATCH', '/api/finance/invoices/1', updateInvoiceData);
      console.log('Update invoice response:', updateInvoiceResponse);
      console.log('');
    }

    // Test 14: Update payment (if payment exists)
    if (getPaymentsResponse.data && getPaymentsResponse.data.length > 0) {
      console.log('14. Testing payment update...');
      const updatePaymentData = {
        notes: "Updated payment notes",
        reference: "REF-2025-001-UPDATED"
      };
      const updatePaymentResponse = await makeRequest('PATCH', '/api/finance/payments/1', updatePaymentData);
      console.log('Update payment response:', updatePaymentResponse);
      console.log('');
    }

    console.log('✅ All finance endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error testing finance endpoints:', error);
  }
}

testFinanceEndpoints(); 