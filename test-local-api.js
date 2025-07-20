const axios = require('axios');

async function testLocalAPI() {
  console.log('🧪 Testing Local API with CORS...\n');

  try {
    // Test basic health endpoint
    console.log('1️⃣ Testing /health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health endpoint working:', healthResponse.data);

    // Test API health endpoint
    console.log('\n2️⃣ Testing /api/health endpoint...');
    const apiHealthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ API health endpoint working:', apiHealthResponse.data);

    // Test CORS with origin header
    console.log('\n3️⃣ Testing CORS with origin header...');
    const corsResponse = await axios.get('http://localhost:5000/api/health', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ CORS test successful:', corsResponse.data);

    console.log('\n🎉 All tests passed! Your local server is working correctly.');
    console.log('   Now refresh your React app - it should connect to localhost:5000');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testLocalAPI(); 