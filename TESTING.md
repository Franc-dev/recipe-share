# 🧪 Testing Guide

## Quick Start

```bash
# Run basic tests (no MongoDB required)
npm test

# Run all tests (requires MongoDB)
cd server && npm run test:all

# Run tests with coverage
cd server && npm run test:coverage
```

## Test Types

### ✅ Basic Tests (Always Work)
These tests verify core API functionality without requiring MongoDB:

- **Health Endpoints**: `/health`, `/api/health`
- **Test Endpoints**: `/api/test`, `/api/cors-test`
- **Error Handling**: 404 responses
- **CORS Configuration**: Cross-origin requests
- **Server Setup**: Express app configuration

### 🗄️ Database Tests (Require MongoDB)
These tests verify database operations and require MongoDB:

- **Authentication**: Register, login, profile
- **Recipes**: CRUD operations, search, pagination
- **Users**: Profile management, following system
- **Data Validation**: Input validation and error handling

## Test Environment

### Local Development
```bash
# Basic tests (recommended for daily development)
npm test

# Full tests (if you have MongoDB running)
cd server && npm run test:all
```

### CI/CD Pipeline
```bash
# All tests run automatically in GitHub Actions
# MongoDB is provided by the CI environment
npm run test:ci
```

## Test Results

### ✅ Success Case
```
🧪 Running RecipeShare Tests...

📋 Test Environment:
   NODE_ENV: test
   JWT_SECRET: ***set***
   MONGODB_URI_TEST: mongodb://localhost:27017/recipe-share-test

1️⃣ Running basic API tests...
✅ Basic tests passed!
   ✅ Server health endpoints working
   ✅ API endpoints responding
   ✅ CORS configuration working
   ✅ Error handling working

🎯 Core API functionality is working correctly!
```

### ⚠️ Expected MongoDB Failures
```
⚠️ Some tests failed (likely due to MongoDB not running)
   This is expected if MongoDB is not installed/running locally
   Tests will pass in CI/CD where MongoDB is provided
   Basic API functionality is working correctly!
```

## Troubleshooting

### MongoDB Connection Issues
If you see MongoDB timeout errors, this is **expected** when MongoDB isn't running locally:

```bash
# Install MongoDB locally (optional)
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Then run full tests:
cd server && npm run test:all
```

### Port Conflicts
If you see "address already in use" errors:

```bash
# Kill processes using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use a different port:
PORT=5001 npm test
```

### Test Timeouts
If tests are taking too long:

```bash
# Increase timeout in jest.config.js
testTimeout: 30000

# Or run with shorter timeout for quick feedback:
cd server && npm run test:watch
```

## Test Coverage

The test suite covers:

- **API Endpoints**: All routes and HTTP methods
- **Authentication**: JWT tokens, user sessions
- **Data Validation**: Input sanitization and validation
- **Error Handling**: Proper error responses
- **CORS**: Cross-origin request handling
- **Database Operations**: CRUD operations with MongoDB

## CI/CD Integration

Tests run automatically in GitHub Actions:

1. **Backend Tests**: Node.js with MongoDB
2. **Frontend Tests**: React with Jest
3. **Integration Tests**: API endpoint testing
4. **Coverage Reports**: Code coverage analysis

## Best Practices

1. **Run basic tests frequently** during development
2. **Run full tests before commits** if you have MongoDB
3. **Check CI/CD results** for comprehensive testing
4. **Use test coverage** to identify untested code
5. **Mock external dependencies** for faster tests

## File Structure

```
server/
├── src/
│   ├── tests/
│   │   ├── setup.js          # Test configuration
│   │   ├── basic.test.js     # Basic API tests
│   │   ├── auth.test.js      # Authentication tests
│   │   ├── recipes.test.js   # Recipe CRUD tests
│   │   └── users.test.js     # User management tests
│   └── ...
├── jest.config.js            # Jest configuration
└── package.json              # Test scripts
```

## Commands Reference

```bash
# Root level
npm test                    # Run basic tests
npm run test:ci            # Run all tests for CI

# Server level
cd server
npm test                   # Run basic tests
npm run test:all          # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
npm run test:ci           # Run tests for CI/CD
``` 