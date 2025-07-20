# CI/CD Testing Setup

This repository is configured with GitHub Actions for automated testing on every push and pull request.

## 🚀 What Gets Tested

### Backend Tests
- Unit tests for API endpoints
- Database integration tests
- Authentication tests
- Input validation tests
- Test coverage reporting

### Frontend Tests
- Component tests
- Integration tests
- User interaction tests
- Test coverage reporting

### Integration Tests
- Server health checks
- API endpoint availability
- CORS configuration
- Database connectivity

### Code Quality
- Linting checks
- Code formatting
- Dependency security

## 📋 GitHub Actions Workflow

The workflow runs on:
- ✅ Push to `main` branch
- ✅ Push to `develop` branch  
- ✅ Pull requests to `main` branch

### Jobs

1. **test-backend** - Runs server tests with MongoDB
2. **test-frontend** - Runs React tests
3. **test-integration** - Tests server startup and API endpoints
4. **lint-and-format** - Checks code quality

## 🧪 Local Testing

### Run All Tests
```bash
npm run test:ci
```

### Run Backend Tests Only
```bash
npm run test:server
```

### Run Frontend Tests Only
```bash
npm run test:client
```

### Setup Test Environment
```bash
npm run test:setup
```

## 🔧 Test Environment

The CI/CD uses:
- **Node.js 18**
- **MongoDB 5.0** (test database)
- **Jest** for testing
- **Codecov** for coverage reporting

### Environment Variables (CI)
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/recipe-share-test
JWT_SECRET=test-secret-key-for-ci
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000
```

## 📊 Test Coverage

Coverage reports are generated for:
- Backend API endpoints
- Frontend components
- Integration tests

Coverage is uploaded to Codecov automatically.

## 🚨 Failed Tests

If tests fail in CI:
1. Check the GitHub Actions logs
2. Run tests locally: `npm run test:ci`
3. Fix the failing tests
4. Push the fix

## 🔄 Continuous Integration

Every commit triggers:
1. ✅ Install dependencies
2. ✅ Run backend tests
3. ✅ Run frontend tests  
4. ✅ Run integration tests
5. ✅ Check code quality
6. ✅ Upload coverage reports

## 📈 Benefits

- **Early bug detection** - Catch issues before they reach production
- **Code quality** - Maintain consistent code standards
- **Confidence** - Know your code works before deploying
- **Documentation** - Tests serve as living documentation
- **Refactoring safety** - Tests ensure changes don't break existing functionality

## 🛠️ Adding New Tests

### Backend Tests
Add tests to `server/src/tests/` directory:
```javascript
// Example test
describe('Recipe API', () => {
  test('should create a new recipe', async () => {
    // Test implementation
  });
});
```

### Frontend Tests
Add tests to `client/src/components/__tests__/` directory:
```javascript
// Example test
describe('RecipeCard', () => {
  test('should render recipe title', () => {
    // Test implementation
  });
});
```

## 📝 Best Practices

1. **Write tests first** - Follow TDD when possible
2. **Keep tests simple** - One assertion per test
3. **Use descriptive names** - Test names should explain what they test
4. **Mock external dependencies** - Don't rely on external services
5. **Maintain test coverage** - Aim for >80% coverage 