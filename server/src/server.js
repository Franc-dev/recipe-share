/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable CSP for testing
}));
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin} - User-Agent: ${req.headers['user-agent']}`);
  next();
});

app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
console.log('🔗 Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-share');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-share', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  bufferCommands: true, // Re-enable buffering to allow queries before connection
  maxPoolSize: 10, // Maintain up to 10 socket connections
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