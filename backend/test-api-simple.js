const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`${path}: ${res.statusCode} ${res.statusCode === 200 ? 'OK' : 'FAILED'}`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`${path}: ERROR - ${err.message}`);
      reject(err);
    });

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testing API endpoints...');
  
  try {
    await testEndpoint('/');
    await testEndpoint('/api/samples');
    await testEndpoint('/api/material-tests');
    await testEndpoint('/api/sample-logs/regular');
    
    console.log('API testing completed.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAllEndpoints(); 