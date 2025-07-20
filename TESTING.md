# Automated Testing Setup

This document describes the automated testing setup for the RecipeShare application deployed on Leapcell.

## 🧪 Testing Overview

The application includes comprehensive automated testing for both backend and frontend components:

- **Backend Tests**: API endpoint testing with Jest and Supertest
- **Frontend Tests**: React component testing with React Testing Library
- **CI/CD Integration**: Automated testing in deployment pipeline
- **Coverage Reporting**: Code coverage analysis

## 📁 Test Structure

```
├── server/
│   ├── src/tests/
│   │   ├── auth.test.js          # Authentication endpoint tests
│   │   ├── recipes.test.js       # Recipe endpoint tests
│   │   ├── users.test.js         # User endpoint tests
│   │   └── setup.js              # Test configuration
│   └── jest.config.js            # Jest configuration
├── client/
│   └── src/
│       ├── components/__tests__/
│       │   └── RecipeCard.test.js # Component tests
│       └── contexts/__tests__/
│           └── AuthContext.test.js # Context tests
├── .github/workflows/
│   └── ci.yml                    # GitHub Actions CI/CD
├── test.sh                       # Local test runner
└── render.yaml                   # Leapcell deployment config
```

## 🚀 Running Tests

### Local Development

#### Quick Test (All Tests)
```bash
# Run the automated test script
./test.sh
```

#### Backend Tests Only
```bash
cd server
npm test                    # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
npm run test:ci            # Run tests for CI environment
```

#### Frontend Tests Only
```bash
cd client
npm test                   # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
npm run test:ci           # Run tests for CI environment
```

### Environment Setup

#### Backend Test Environment
```bash
export NODE_ENV=test
export MONGODB_URI_TEST=mongodb://localhost:27017/recipe-share-test
export JWT_SECRET=test-secret-key
```

#### Frontend Test Environment
```bash
export CI=true
export REACT_APP_API_URL=http://localhost:5000
```

## 📊 Test Coverage

### Backend Coverage Requirements
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Frontend Coverage Requirements
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## 🔧 Test Configuration

### Jest Configuration (Backend)
```javascript
// server/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/seeders/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testTimeout: 10000
};
```

### Test Setup (Backend)
```javascript
// server/src/tests/setup.js
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/recipe-share-test';
jest.setTimeout(30000);
```

## 🧪 Test Categories

### Backend Tests

#### Authentication Tests (`auth.test.js`)
- User registration
- User login
- Token validation
- Profile retrieval

#### Recipe Tests (`recipes.test.js`)
- Recipe CRUD operations
- Recipe search functionality
- Authorization checks
- Input validation

#### User Tests (`users.test.js`)
- User profile management
- User following system
- User recipe listings
- Profile updates

### Frontend Tests

#### Component Tests
- RecipeCard component rendering
- User interaction handling
- Props validation
- Error state handling

#### Context Tests
- Authentication state management
- User login/logout flow
- Token persistence
- Error handling

## 🔄 CI/CD Integration

### GitHub Actions Workflow
The `.github/workflows/ci.yml` file defines the CI/CD pipeline:

1. **Backend Testing**: Runs with MongoDB service
2. **Frontend Testing**: Runs React component tests
3. **Build Process**: Creates production build
4. **Deployment**: Deploys to Leapcell (Render)

### Leapcell Integration
The `render.yaml` file includes test commands in the build process:

```yaml
services:
  - type: web
    name: recipe-share-backend
    buildCommand: |
      cd server && npm install
      npm test
    # ... other configuration

  - type: web
    name: recipe-share-frontend
    buildCommand: |
      cd client && npm install
      npm test -- --watchAll=false --passWithNoTests
      npm run build
    # ... other configuration
```

## 🐛 Debugging Tests

### Common Issues

#### MongoDB Connection Issues
```bash
# Ensure MongoDB is running
mongod --dbpath /path/to/data/db

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:5.0
```

#### Test Timeout Issues
```javascript
// Increase timeout in test files
jest.setTimeout(30000);
```

#### Environment Variable Issues
```bash
# Check environment variables
echo $NODE_ENV
echo $MONGODB_URI_TEST
echo $JWT_SECRET
```

### Debug Mode
```bash
# Run tests in debug mode
npm test -- --verbose --detectOpenHandles
```

## 📈 Coverage Reports

### Generate Coverage Reports
```bash
# Backend coverage
cd server && npm run test:coverage

# Frontend coverage
cd client && npm run test:coverage
```

### View Coverage Reports
- Backend: `server/coverage/lcov-report/index.html`
- Frontend: `client/coverage/lcov-report/index.html`

## 🚀 Best Practices

### Writing Tests
1. **Test Structure**: Use describe/it blocks for organization
2. **Test Names**: Use descriptive test names
3. **Setup/Teardown**: Use beforeEach/afterEach for cleanup
4. **Mocking**: Mock external dependencies
5. **Assertions**: Use specific assertions

### Test Data
1. **Test Database**: Use separate test database
2. **Cleanup**: Clean up test data after each test
3. **Fixtures**: Use consistent test data
4. **Isolation**: Ensure tests don't depend on each other

### Performance
1. **Parallel Execution**: Run tests in parallel when possible
2. **Database Connections**: Reuse database connections
3. **Mocking**: Mock slow operations
4. **Timeouts**: Set appropriate timeouts

## 🔍 Monitoring

### Test Metrics
- Test execution time
- Coverage percentage
- Test pass/fail rates
- Code quality metrics

### Alerts
- Failed builds
- Coverage drops
- Performance regressions
- Security vulnerabilities

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain coverage thresholds
4. Update documentation
5. Run the full test suite before committing 