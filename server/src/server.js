/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://sawe-recipe-share.vercel.app',
      'https://recipe-share-app.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://sawe-recipe-share.vercel.app',
      'https://recipe-share-app.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin} - User-Agent: ${req.headers['user-agent']}`);
  next();
});

// Handle CORS preflight requests
app.options('*', cors());

app.use(morgan('combined'));
// app.use(limiter); // Temporarily disable rate limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
console.log('🔗 Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? '***configured***' : 'NOT SET');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Increase for production
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2, // Maintain minimum connections
  retryWrites: true,
  retryReads: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log('Database name:', mongoose.connection.name);
  console.log('Database host:', mongoose.connection.host);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit if database connection fails
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
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

// Simple test endpoint for CORS
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://sawe-recipe-share.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
  res.json({ 
    status: 'OK', 
    message: 'CORS test successful!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Public recipes endpoint for testing
app.get('/api/public/recipes', async (req, res) => {
  try {
    const Recipe = require('./models/Recipe');
    const recipes = await Recipe.find({ isPublic: true }).limit(5);
    res.json({
      success: true,
      message: 'Public recipes endpoint working',
      count: recipes.length,
      recipes: recipes.map(r => ({ id: r._id, title: r.title }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: error.message
    });
  }
});

// Simple database test endpoint
app.get('/api/test-db-simple', async (req, res) => {
  try {
    const Recipe = require('./models/Recipe');
    const User = require('./models/User');
    
    const recipeCount = await Recipe.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      message: 'Database connection working',
      recipeCount,
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 