// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/recipe-share-test';

const mongoose = require('mongoose');

// Mock MongoDB for tests
beforeAll(async () => {
  // Use in-memory MongoDB for tests
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/recipe-share-test';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Test database connected');
  } catch (error) {
    // MongoDB not available - tests will run without database
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    // Connection already closed
  }
});

// Clean up database between tests
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  } catch (error) {
    // Database not available - continue
  }
});

// Increase timeout for tests
jest.setTimeout(30000); 