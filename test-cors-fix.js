const axios = require('axios');

async function testCORSFix() {
  console.log('🧪 Testing CORS Fix...\n');

  const baseURL = 'http://localhost:5000';
  const testOrigin = 'http://localhost:3000';

  // Test 1: OPTIONS preflight request
  console.log('1️⃣ Testing OPTIONS preflight request...');
  try {
    const optionsResponse = await axios({
      method: 'OPTIONS',
      url: `${baseURL}/api/health`,
      headers: {
        'Origin': testOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log('✅ OPTIONS request successful');
    console.log('   Status:', optionsResponse.status);
    console.log('   CORS Headers:', {
      'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
    });
  } catch (error) {
    console.log('❌ OPTIONS request failed:', error.message);
  }

  // Test 2: Actual GET request
  console.log('\n2️⃣ Testing GET request...');
  try {
    const getResponse = await axios({
      method: 'GET',
      url: `${baseURL}/api/health`,
      headers: {
        'Origin': testOrigin,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ GET request successful');
    console.log('   Status:', getResponse.status);
    console.log('   Data:', getResponse.data);
  } catch (error) {
    console.log('❌ GET request failed:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
  }

  // Test 3: Test with Authorization header
  console.log('\n3️⃣ Testing request with Authorization header...');
  try {
    const authResponse = await axios({
      method: 'GET',
      url: `${baseURL}/api/recipes/featured`,
      headers: {
        'Origin': testOrigin,
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('✅ Auth request successful');
    console.log('   Status:', authResponse.status);
  } catch (error) {
    console.log('❌ Auth request failed:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
  }

  console.log('\n🎯 If all tests pass, CORS should be working!');
  console.log('   Try refreshing your React app now.');
}

testCORSFix().catch(console.error); 