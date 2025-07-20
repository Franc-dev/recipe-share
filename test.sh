#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Starting automated testing...${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Check if MongoDB is running (for backend tests)
if ! command_exists mongod; then
    echo -e "${YELLOW}⚠️  MongoDB not found. Backend tests may fail if MongoDB is not running.${NC}"
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo -e "${YELLOW}🔧 Setting up test environment...${NC}"

# Set test environment variables
export NODE_ENV=test
export MONGODB_URI_TEST=mongodb://localhost:27017/recipe-share-test
export JWT_SECRET=test-secret-key
export CI=true

echo -e "${YELLOW}🧪 Running backend tests...${NC}"

# Run backend tests
cd server
npm test
BACKEND_TEST_RESULT=$?

if [ $BACKEND_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
fi

echo -e "${YELLOW}🧪 Running frontend tests...${NC}"

# Run frontend tests
cd ../client
npm test -- --watchAll=false --passWithNoTests
FRONTEND_TEST_RESULT=$?

if [ $FRONTEND_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
else
    echo -e "${RED}❌ Frontend tests failed!${NC}"
fi

cd ..

echo -e "${YELLOW}📊 Test Results Summary:${NC}"

if [ $BACKEND_TEST_RESULT -eq 0 ] && [ $FRONTEND_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo -e "${GREEN}✅ Backend: PASSED${NC}"
    echo -e "${GREEN}✅ Frontend: PASSED${NC}"
    exit 0
else
    echo -e "${RED}💥 Some tests failed!${NC}"
    if [ $BACKEND_TEST_RESULT -ne 0 ]; then
        echo -e "${RED}❌ Backend: FAILED${NC}"
    fi
    if [ $FRONTEND_TEST_RESULT -ne 0 ]; then
        echo -e "${RED}❌ Frontend: FAILED${NC}"
    fi
    exit 1
fi 