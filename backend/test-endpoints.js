const http = require('http');

// Generate unique receipt numbers
const generateReceiptNumber = (suffix) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SR-${year}-${month}${day}-${random}-${suffix}`;
};

// Test data for regular sample log
const regularSampleLogData = {
  sampleReceiptNumber: generateReceiptNumber("REG"),
  dateOfReceipt: "2025-06-29T00:00:00.000Z",
  projectNumber: "PRJ-2025-001",
  clientName: "Acme Corp",
  project: "Bridge Construction",
  materialCategory: "Concrete",
  unitNumbers: 5,
  engineerInCharge: "Jane Engineer",
  materialTests: JSON.stringify(["Compressive Strength", "Slump Test"]),
  technicianInCharge: "John Technician",
  leadTimeDays: 14,
  status: "On Hold"
};

// Test data for special sample log
const specialSampleLogData = {
  sampleReceiptNumber: generateReceiptNumber("SPC"),
  dateOfReceipt: "2025-06-29T00:00:00.000Z",
  clientName: "Beta Ltd",
  project: "Road Paving",
  dimensions: "150x150x150mm",
  dateOfCast: "2025-06-20T00:00:00.000Z",
  dateOfTest: "2025-07-05T00:00:00.000Z",
  class: "C30/37",
  areaOfUse: "Pavement",
  remark: "No visible cracks",
  failureMode: "Shear",
  dueTime: 15,
  specialUnits: [
    { serialNumber: "A1", weight: 2.5, load: 30 },
    { serialNumber: "A2", weight: 2.6, load: 32 }
  ]
};

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

async function testEndpoints() {
  console.log('Testing Sample Logs Endpoints...\n');

  try {
    // Test root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await makeRequest('GET', '/');
    console.log('Root response:', rootResponse);
    console.log('');

    // Test creating regular sample log
    console.log('2. Testing POST /api/sample-logs/regular...');
    const createRegularResponse = await makeRequest('POST', '/api/sample-logs/regular', regularSampleLogData);
    console.log('Create regular response:', createRegularResponse);
    console.log('');

    // Test getting all regular sample logs
    console.log('3. Testing GET /api/sample-logs/regular...');
    const getRegularResponse = await makeRequest('GET', '/api/sample-logs/regular');
    console.log('Get regular response:', getRegularResponse);
    console.log('');

    // Test creating special sample log
    console.log('4. Testing POST /api/sample-logs/special...');
    const createSpecialResponse = await makeRequest('POST', '/api/sample-logs/special', specialSampleLogData);
    console.log('Create special response:', createSpecialResponse);
    console.log('');

    // Test getting all special sample logs
    console.log('5. Testing GET /api/sample-logs/special...');
    const getSpecialResponse = await makeRequest('GET', '/api/sample-logs/special');
    console.log('Get special response:', getSpecialResponse);
    console.log('');

    // Test getting users by role level
    console.log('6. Testing GET /api/users/by-role/2-3...');
    const getUsersResponse = await makeRequest('GET', '/api/users/by-role/2-3');
    console.log('Get users by role response:', getUsersResponse);
    console.log('');

    console.log('All tests completed!');

  } catch (error) {
    console.error('Error testing endpoints:', error);
  }
}

testEndpoints(); 