/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require('axios');

async function testCORS() {
  const urls = [
    'http://localhost:5000',
    'http://localhost:5000/api/test',
    'http://localhost:5000/api/cors-test',
    'http://localhost:5000/health'
  ];

  console.log('🧪 Testing CORS and server connectivity...\n');

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'Origin': 'http://localhost:3000',
          'User-Agent': 'CORS-Test-Script'
        }
      });
      
      console.log(`✅ SUCCESS: ${response.status} - ${response.data.message || 'OK'}`);
      
      if (response.headers['access-control-allow-origin']) {
        console.log(`   CORS Header: ${response.headers['access-control-allow-origin']}`);
      }
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }
}

// Test with different origins
async function testMultipleOrigins() {
  const origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://your-frontend-domain.com',
    'http://localhost:3001'
  ];

  console.log('🌐 Testing multiple origins...\n');

  for (const origin of origins) {
    try {
      const response = await axios.get('http://localhost:5000/api/cors-test', {
        headers: {
          'Origin': origin,
          'User-Agent': 'CORS-Test-Script'
        }
      });
      
      console.log(`✅ Origin ${origin}: ${response.status} - ${response.data.message}`);
      
    } catch (error) {
      console.log(`❌ Origin ${origin}: ${error.message}`);
    }
  }
}

// Run tests
async function runTests() {
  await testCORS();
  await testMultipleOrigins();
}

runTests().catch(console.error); 