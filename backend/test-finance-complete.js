const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Test data
const testInvoice = {
  clientId: 1,
  items: [
    {
      description: 'Comprehensive test item',
      quantity: 2,
      unitPrice: 25000
    }
  ],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  issuedBy: 2,
  notes: 'Test invoice for comprehensive testing',
  terms: 'Net 30'
};

const testPayment = {
  invoiceId: 1,
  amount: 30000,
  paymentMethod: 'mobile_money',
  reference: 'TEST-PAY-001',
  notes: 'Test payment for comprehensive testing',
  receivedBy: 2
};

async function testFinanceModule() {
  console.log('🧪 Starting Comprehensive Finance Module Test\n');

  try {
    // Test 1: Get all invoices
    console.log('1. Testing GET /api/finance/invoices');
    const invoicesResponse = await axios.get(`${BASE_URL}/finance/invoices`);
    console.log(`✅ Success: Found ${invoicesResponse.data.length} invoices`);
    console.log(`   Sample invoice: ${invoicesResponse.data[0]?.invoiceNumber || 'None'}\n`);

    // Test 2: Get all payments
    console.log('2. Testing GET /api/finance/payments');
    const paymentsResponse = await axios.get(`${BASE_URL}/finance/payments`);
    console.log(`✅ Success: Found ${paymentsResponse.data.length} payments`);
    console.log(`   Sample payment: ${paymentsResponse.data[0]?.reference || 'None'}\n`);

    // Test 3: Create a new invoice
    console.log('3. Testing POST /api/finance/invoices');
    const createInvoiceResponse = await axios.post(`${BASE_URL}/finance/invoices`, testInvoice);
    console.log(`✅ Success: Created invoice ${createInvoiceResponse.data.invoiceNumber}`);
    const newInvoiceId = createInvoiceResponse.data.id;

    // Test 4: Get specific invoice
    console.log('4. Testing GET /api/finance/invoices/:id');
    const getInvoiceResponse = await axios.get(`${BASE_URL}/finance/invoices/${newInvoiceId}`);
    console.log(`✅ Success: Retrieved invoice ${getInvoiceResponse.data.invoiceNumber}\n`);

    // Test 5: Create a payment for the new invoice
    console.log('5. Testing POST /api/finance/payments');
    const paymentData = { ...testPayment, invoiceId: newInvoiceId };
    const createPaymentResponse = await axios.post(`${BASE_URL}/finance/payments`, paymentData);
    console.log(`✅ Success: Created payment ${createPaymentResponse.data.reference}`);
    const newPaymentId = createPaymentResponse.data.id;

    // Test 6: Get specific payment
    console.log('6. Testing GET /api/finance/payments/:id');
    const getPaymentResponse = await axios.get(`${BASE_URL}/finance/payments/${newPaymentId}`);
    console.log(`✅ Success: Retrieved payment ${getPaymentResponse.data.reference}\n`);

    // Test 7: Get revenue report
    console.log('7. Testing GET /api/finance/reports/revenue');
    const revenueResponse = await axios.get(`${BASE_URL}/finance/reports/revenue`);
    console.log(`✅ Success: Revenue report generated`);
    console.log(`   Revenue data: ${JSON.stringify(revenueResponse.data).substring(0, 100)}...\n`);

    // Test 8: Get outstanding report
    console.log('8. Testing GET /api/finance/reports/outstanding');
    const outstandingResponse = await axios.get(`${BASE_URL}/finance/reports/outstanding`);
    console.log(`✅ Success: Outstanding report generated`);
    console.log(`   Outstanding data: ${JSON.stringify(outstandingResponse.data).substring(0, 100)}...\n`);

    // Test 9: Get cash flow report
    console.log('9. Testing GET /api/finance/reports/cashflow');
    const cashflowResponse = await axios.get(`${BASE_URL}/finance/reports/cashflow`);
    console.log(`✅ Success: Cash flow report generated`);
    console.log(`   Cash flow data: ${JSON.stringify(cashflowResponse.data).substring(0, 100)}...\n`);

    // Test 10: Get client accounts
    console.log('10. Testing GET /api/finance/accounts');
    const accountsResponse = await axios.get(`${BASE_URL}/finance/accounts`);
    console.log(`✅ Success: Found ${accountsResponse.data.length} client accounts`);
    if (accountsResponse.data.length > 0) {
      console.log(`   Sample account: Client ${accountsResponse.data[0].clientId}, Balance: ${accountsResponse.data[0].balance}\n`);
    }

    // Test 11: Update invoice status
    console.log('11. Testing PATCH /api/finance/invoices/:id');
    const updateInvoiceResponse = await axios.patch(`${BASE_URL}/finance/invoices/${newInvoiceId}`, {
      status: 'partial'
    });
    console.log(`✅ Success: Updated invoice status to ${updateInvoiceResponse.data.status}\n`);

    // Test 12: Update payment
    console.log('12. Testing PATCH /api/finance/payments/:id');
    const updatePaymentResponse = await axios.patch(`${BASE_URL}/finance/payments/${newPaymentId}`, {
      notes: 'Updated payment notes for testing'
    });
    console.log(`✅ Success: Updated payment notes\n`);

    console.log('🎉 All Finance Module Tests Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Invoices: ${invoicesResponse.data.length + 1} total (1 created)`);
    console.log(`   - Payments: ${paymentsResponse.data.length + 1} total (1 created)`);
    console.log(`   - Reports: 3 types tested`);
    console.log(`   - Client Accounts: ${accountsResponse.data.length} found`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

// Run the test
testFinanceModule(); 