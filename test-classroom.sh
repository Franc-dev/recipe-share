#!/bin/bash

echo "🧪 Running Classroom Tests..."
echo "================================"

# Test 1: Check for README.md
echo "Test 1: Checking for README.md..."
if test -f README.md; then
    echo "✅ README.md found"
else
    echo "❌ README.md not found"
    exit 1
fi

# Test 2: Check for frontend and backend structure
echo "Test 2: Checking for frontend and backend structure..."
if test -d client && test -d server; then
    echo "✅ Frontend and backend structure found"
else
    echo "❌ Frontend and backend structure not found"
    exit 1
fi

# Test 3: Check for package.json files
echo "Test 3: Checking for package.json files..."
if test -f client/package.json && test -f server/package.json; then
    echo "✅ Package.json files found"
else
    echo "❌ Package.json files not found"
    exit 1
fi

# Test 4: Check for MongoDB integration
echo "Test 4: Checking for MongoDB integration..."
if grep -q "mongoose\|mongodb" server/package.json; then
    echo "✅ MongoDB integration found in server/package.json"
elif grep -q "mongoose\|mongodb" server/src -r; then
    echo "✅ MongoDB integration found in server/src"
else
    echo "❌ MongoDB integration not found"
    exit 1
fi

# Test 5: Check for Express.js backend
echo "Test 5: Checking for Express.js backend..."
if grep -q "express" server/package.json; then
    echo "✅ Express.js backend found"
else
    echo "❌ Express.js backend not found"
    exit 1
fi

# Test 6: Check for React frontend
echo "Test 6: Checking for React frontend..."
if grep -q "react" client/package.json; then
    echo "✅ React frontend found"
else
    echo "❌ React frontend not found"
    exit 1
fi

# Test 7: Check for authentication implementation
echo "Test 7: Checking for authentication implementation..."
if grep -q "auth\|login\|register\|jwt\|token\|password" server/src -r; then
    echo "✅ Authentication implementation found"
else
    echo "❌ Authentication implementation not found"
    exit 1
fi

# Test 8: Check for testing setup
echo "Test 8: Checking for testing setup..."
if grep -q "test\|jest\|mocha\|cypress\|playwright" client/package.json || grep -q "test\|jest\|mocha\|cypress\|playwright" server/package.json; then
    echo "✅ Testing setup found"
else
    echo "❌ Testing setup not found"
    exit 1
fi

# Test 9: Check for API endpoints
echo "Test 9: Checking for API endpoints..."
if grep -q "router\|app.get\|app.post\|app.put\|app.delete" server/src -r; then
    echo "✅ API endpoints found"
else
    echo "❌ API endpoints not found"
    exit 1
fi

# Test 10: Check for deployment information
echo "Test 10: Checking for deployment information..."
if grep -q "deploy\|vercel\|netlify\|heroku\|render\|railway\|production\|live" README.md; then
    echo "✅ Deployment information found"
else
    echo "❌ Deployment information not found"
    exit 1
fi

echo "================================"
echo "🎉 All classroom tests passed!"
echo "✅ Ready to push to GitHub!" 