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

async function testFinanceWithClient() {
  console.log('🧪 Testing Finance Module with Client Creation...\n');

  try {
    // Get existing users
    console.log('1. Getting existing users...');
    const usersResponse = await makeRequest('GET', '/api/users');
    console.log('Users found:', usersResponse.data.length);
    console.log('');

    if (usersResponse.data.length === 0) {
      console.log('❌ No users found.');
      return;
    }

    const issuerId = usersResponse.data[0].id;

    // Create a client first
    console.log('2. Creating a test client...');
    const clientData = {
      name: "Test Finance Client",
      address: "123 Finance Street, Kampala",
      contact: "+256123456789",
      email: "client@test.com",
      phone: "+256123456789",
      status: "active"
    };
    
    // Note: We need to create a client via the API or directly in the database
    // For now, let's assume we'll create it via a client endpoint
    // If there's no client endpoint, we'll need to create it directly in the database
    
    console.log('Client data:', JSON.stringify(clientData, null, 2));
    console.log('');

    // For now, let's create a client directly in the database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const client = await prisma.client.create({
      data: clientData
    });
    
    console.log('Client created with ID:', client.id);
    console.log('');

    // Test 3: Create an invoice with the new client
    console.log('3. Testing invoice creation with new client...');
    const invoiceData = {
      clientId: client.id,
      items: [
        {
          description: "Concrete Compressive Strength Test",
          quantity: 3,
          unitPrice: 50000,
          testId: null
        },
        {
          description: "Slump Test",
          quantity: 1,
          unitPrice: 25000,
          testId: null
        }
      ],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Test invoice for finance module",
      terms: "Net 30",
      issuedBy: issuerId
    };

    console.log('Invoice data:', JSON.stringify(invoiceData, null, 2));
    console.log('');

    const invoiceResponse = await makeRequest('POST', '/api/finance/invoices', invoiceData);
    console.log('Invoice creation response:', invoiceResponse);
    console.log('');

    // Test 4: Get all invoices
    console.log('4. Testing get all invoices...');
    const getInvoicesResponse = await makeRequest('GET', '/api/finance/invoices');
    console.log('Get invoices response:', getInvoicesResponse);
    console.log('');

    // Test 5: Create a payment (if invoice exists)
    if (invoiceResponse.status === 201 || invoiceResponse.status === 200) {
      console.log('5. Testing payment creation...');
      const paymentData = {
        invoiceId: 1,
        amount: 100000,
        paymentMethod: "bank_transfer",
        reference: "REF-2025-001",
        notes: "Partial payment for test invoice",
        receivedBy: issuerId
      };
      const paymentResponse = await makeRequest('POST', '/api/finance/payments', paymentData);
      console.log('Payment creation response:', paymentResponse);
      console.log('');
    }

    // Test 6: Get all payments
    console.log('6. Testing get all payments...');
    const getPaymentsResponse = await makeRequest('GET', '/api/finance/payments');
    console.log('Get payments response:', getPaymentsResponse);
    console.log('');

    // Test 7: Get client accounts
    console.log('7. Testing get client accounts...');
    const getAccountsResponse = await makeRequest('GET', '/api/finance/accounts');
    console.log('Get client accounts response:', getAccountsResponse);
    console.log('');

    // Test 8: Get revenue report
    console.log('8. Testing revenue report...');
    const revenueResponse = await makeRequest('GET', '/api/finance/reports/revenue');
    console.log('Revenue report response:', revenueResponse);
    console.log('');

    await prisma.$disconnect();

    console.log('✅ Finance module tests completed!');

  } catch (error) {
    console.error('❌ Error testing finance endpoints:', error);
  }
}

testFinanceWithClient(); 