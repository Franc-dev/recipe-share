#!/bin/bash

echo "🍽️  RecipeShare - Quick Start Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    echo "🔍 Checking MongoDB status..."
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. You can start it with 'mongod' or use MongoDB Atlas."
    fi
else
    echo "⚠️  MongoDB is not installed locally. You can use MongoDB Atlas instead."
fi

# Create environment files if they don't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cp server/env.example server/.env
    echo "⚠️  Please update server/.env with your MongoDB connection string and JWT secret"
fi

if [ ! -f "client/.env" ]; then
    echo "📝 Creating client environment file..."
    echo "REACT_APP_API_URL=http://localhost:5000" > client/.env
fi

echo ""
echo "🚀 Starting development servers..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev 