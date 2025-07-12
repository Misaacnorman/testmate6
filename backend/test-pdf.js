const http = require('http');
const fs = require('fs');

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
        if (res.headers['content-type'] === 'application/pdf') {
          // Save PDF to file
          const filename = `sample-receipt-${Date.now()}.pdf`;
          fs.writeFileSync(filename, body);
          resolve({ status: res.statusCode, data: `PDF saved as ${filename}` });
        } else {
          try {
            const response = JSON.parse(body);
            resolve({ status: res.statusCode, data: response });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
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

async function testPDF() {
  console.log('Testing PDF Generation Endpoint...\n');

  try {
    // Test PDF generation for regular sample log (ID 1)
    console.log('1. Testing PDF generation for regular sample log (ID 1)...');
    const pdfResponse = await makeRequest('GET', '/api/samples/1/receipt');
    console.log('PDF response:', pdfResponse);
    console.log('');

    // Test PDF generation for special sample log (ID 1)
    console.log('2. Testing PDF generation for special sample log (ID 1)...');
    const pdfResponse2 = await makeRequest('GET', '/api/samples/1/receipt');
    console.log('PDF response 2:', pdfResponse2);
    console.log('');

    console.log('All PDF tests completed!');

  } catch (error) {
    console.error('Error testing PDF endpoint:', error);
  }
}

testPDF(); 