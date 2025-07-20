const fs = require('fs');
const path = require('path');

// Create test environment files for CI/CD
function setupTestEnv() {
  console.log('🔧 Setting up test environment...');

  // Create server .env for testing
  const serverEnv = `# Test Environment Configuration
PORT=5000
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/recipe-share-test
MONGODB_URI_TEST=mongodb://localhost:27017/recipe-share-test
JWT_SECRET=test-secret-key-for-ci-cd
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  // Create client .env for testing
  const clientEnv = `# Test Environment Configuration
REACT_APP_API_URL=http://localhost:5000
CI=true
`;

  try {
    // Write server .env
    fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnv);
    console.log('✅ Server .env created');

    // Write client .env
    fs.writeFileSync(path.join(__dirname, 'client', '.env'), clientEnv);
    console.log('✅ Client .env created');

    console.log('🎉 Test environment setup complete!');
  } catch (error) {
    console.error('❌ Error setting up test environment:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTestEnv();
}

module.exports = { setupTestEnv }; 