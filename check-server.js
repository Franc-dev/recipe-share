const http = require('http');

function checkServer() {
  console.log('🔍 Checking if server is running on port 5000...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    console.log('✅ Server is running!');
    console.log('   Status:', res.statusCode);
    console.log('   Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('   Response:', data);
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Server is not running or not accessible');
    console.log('   Error:', err.message);
    console.log('\n💡 To start the server:');
    console.log('   cd server && npm start');
  });
  
  req.on('timeout', () => {
    console.log('⏰ Request timed out - server might be slow to respond');
    req.destroy();
  });
  
  req.end();
}

checkServer(); 