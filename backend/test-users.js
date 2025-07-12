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

async function testUsers() {
  console.log('Testing User Role Endpoints...\n');

  try {
    // Test getting all users
    console.log('1. Testing GET /api/users...');
    const usersResponse = await makeRequest('GET', '/api/users');
    console.log('Users response:', usersResponse);
    console.log('');

    // Test getting all roles
    console.log('2. Testing GET /api/roles...');
    const rolesResponse = await makeRequest('GET', '/api/roles');
    console.log('Roles response:', rolesResponse);
    console.log('');

    // Test getting users by role level 2-3
    console.log('3. Testing GET /api/users/by-role/2-3...');
    const usersByRoleResponse = await makeRequest('GET', '/api/users/by-role/2-3');
    console.log('Users by role 2-3 response:', usersByRoleResponse);
    console.log('');

    // Test getting users by role level 3
    console.log('4. Testing GET /api/users/by-role/3...');
    const usersByRole3Response = await makeRequest('GET', '/api/users/by-role/3');
    console.log('Users by role 3 response:', usersByRole3Response);
    console.log('');

    console.log('All user tests completed!');

  } catch (error) {
    console.error('Error testing user endpoints:', error);
  }
}

testUsers(); 