const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the main endpoint
    const mainResponse = await fetch('http://localhost:4000/');
    console.log('Main endpoint:', mainResponse.status, mainResponse.ok ? 'OK' : 'FAILED');
    
    // Test the samples endpoint
    const samplesResponse = await fetch('http://localhost:4000/api/samples');
    console.log('Samples endpoint:', samplesResponse.status, samplesResponse.ok ? 'OK' : 'FAILED');
    
    // Test the material tests endpoint
    const testsResponse = await fetch('http://localhost:4000/api/material-tests');
    console.log('Material tests endpoint:', testsResponse.status, testsResponse.ok ? 'OK' : 'FAILED');
    
    // Test the sample logs endpoint
    const logsResponse = await fetch('http://localhost:4000/api/sample-logs/regular');
    console.log('Sample logs endpoint:', logsResponse.status, logsResponse.ok ? 'OK' : 'FAILED');
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI(); 