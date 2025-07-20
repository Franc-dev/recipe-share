const axios = require('axios');

async function testSetup() {
  console.log('🧪 Testing RecipeShare Setup...\n');

  // Test 1: Check if server is running
  console.log('1️⃣ Testing server connectivity...');
  try {
    const healthResponse = await axios.get('http://localhost:5000/health', {
      timeout: 5000
    });
    console.log('✅ Server is running:', healthResponse.data);
  } catch (error) {
    console.log('❌ Server not running or not accessible');
    console.log('   Error:', error.message);
    console.log('   Make sure to run: cd server && npm start\n');
    return;
  }

  // Test 2: Test API endpoints
  console.log('\n2️⃣ Testing API endpoints...');
  const endpoints = [
    '/api/health',
    '/api/cors-test',
    '/api/test'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`http://localhost:5000${endpoint}`, {
        timeout: 5000
      });
      console.log(`✅ ${endpoint}:`, response.data.message || 'OK');
    } catch (error) {
      console.log(`❌ ${endpoint}:`, error.message);
    }
  }

  // Test 3: Test CORS
  console.log('\n3️⃣ Testing CORS...');
  try {
    const corsResponse = await axios.get('http://localhost:5000/api/cors-test', {
      timeout: 5000,
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ CORS is working:', corsResponse.data.message);
  } catch (error) {
    console.log('❌ CORS issue:', error.message);
  }

  // Test 4: Environment check
  console.log('\n4️⃣ Environment check...');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('   REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'not set');
  console.log('   REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL || 'not set');

  console.log('\n🎯 Next steps:');
  console.log('   1. Make sure server is running: cd server && npm start');
  console.log('   2. Start client: cd client && npm start');
  console.log('   3. Check browser console for React Query debugger');
  console.log('   4. Look for the yellow debug box on the home page');
}

testSetup().catch(console.error); 