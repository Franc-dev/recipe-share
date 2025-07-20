/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// PROPER CORS CONFIGURATION
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://recipe-share-app.vercel.app',
      'https://sawe-recipe-share.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    console.log('🌐 CORS check - Origin:', origin);
    console.log('🌐 CORS check - Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Simple startup test
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint hit');
  res.json({ 
    status: 'OK', 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check that works without database
app.get('/health', (req, res) => {
  console.log('🏥 Health check hit');
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Removed morgan and other middleware that might interfere
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  console.log('🔗 Connecting to MongoDB...');
  console.log('MongoDB URI:', process.env.MONGODB_URI.includes('localhost') ? '***configured***' : process.env.MONGODB_URI);
  
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ MongoDB connection error:', err);
      console.log('⚠️ Server will continue without database connection');
    }
  });

  // Handle MongoDB connection events
  mongoose.connection.on('error', (err) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ MongoDB connection error:', err);
    }
  });

  mongoose.connection.on('disconnected', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('⚠️ MongoDB disconnected');
    }
  });
} else {
  console.log('⚠️ No MongoDB URI provided - running without database');
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// CORS TEST ENDPOINT - Put this BEFORE other routes
app.get('/api/cors-test', (req, res) => {
  console.log('🎯 CORS test endpoint hit!');
  console.log('🎯 Method:', req.method);
  console.log('🎯 Origin:', req.headers.origin);
  console.log('🎯 User-Agent:', req.headers['user-agent']);
  
  res.json({ 
    status: 'SUCCESS', 
    message: 'CORS is working! 🎉',
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint hit');
  res.json({ 
    status: 'OK', 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Recipe Share API is running' });
});

// Leapcell health check endpoint
app.get('/kaithhealthcheck', (req, res) => {
  res.json({ status: 'OK', message: 'Leapcell health check passed' });
});

// Public recipes endpoint for testing
app.get('/api/public/recipes', async (req, res) => {
  console.log('📚 Public recipes endpoint hit');
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        message: 'Public recipes endpoint working (no database)',
        count: 0,
        recipes: []
      });
    }
    
    const Recipe = require('./models/Recipe');
    const recipes = await Recipe.find({ isPublic: true }).limit(5);
    res.json({
      success: true,
      message: 'Public recipes endpoint working',
      count: recipes.length,
      recipes: recipes.map(r => ({ id: r._id, title: r.title }))
    });
  } catch (error) {
    console.error('❌ Error in public recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: error.message
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Test your CORS at: http://localhost:${PORT}/api/cors-test`);
    console.log(`🏠 Health check at: http://localhost:${PORT}/health`);
  });
}

module.exports = app;