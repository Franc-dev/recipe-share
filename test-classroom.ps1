Write-Host "🧪 Running Classroom Tests..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test 1: Check for README.md
Write-Host "Test 1: Checking for README.md..." -ForegroundColor Yellow
if (Test-Path "README.md") {
    Write-Host "✅ README.md found" -ForegroundColor Green
} else {
    Write-Host "❌ README.md not found" -ForegroundColor Red
    exit 1
}

# Test 2: Check for frontend and backend structure
Write-Host "Test 2: Checking for frontend and backend structure..." -ForegroundColor Yellow
if ((Test-Path "client") -and (Test-Path "server")) {
    Write-Host "✅ Frontend and backend structure found" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend and backend structure not found" -ForegroundColor Red
    exit 1
}

# Test 3: Check for package.json files
Write-Host "Test 3: Checking for package.json files..." -ForegroundColor Yellow
if ((Test-Path "client/package.json") -and (Test-Path "server/package.json")) {
    Write-Host "✅ Package.json files found" -ForegroundColor Green
} else {
    Write-Host "❌ Package.json files not found" -ForegroundColor Red
    exit 1
}

# Test 4: Check for MongoDB integration
Write-Host "Test 4: Checking for MongoDB integration..." -ForegroundColor Yellow
$serverPackage = Get-Content "server/package.json" -Raw
if ($serverPackage -match "mongoose|mongodb") {
    Write-Host "✅ MongoDB integration found in server/package.json" -ForegroundColor Green
} else {
    $serverFiles = Get-ChildItem "server/src" -Recurse -File | Get-Content -Raw
    if ($serverFiles -match "mongoose|mongodb") {
        Write-Host "✅ MongoDB integration found in server/src" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB integration not found" -ForegroundColor Red
        exit 1
    }
}

# Test 5: Check for Express.js backend
Write-Host "Test 5: Checking for Express.js backend..." -ForegroundColor Yellow
if ($serverPackage -match "express") {
    Write-Host "✅ Express.js backend found" -ForegroundColor Green
} else {
    Write-Host "❌ Express.js backend not found" -ForegroundColor Red
    exit 1
}

# Test 6: Check for React frontend
Write-Host "Test 6: Checking for React frontend..." -ForegroundColor Yellow
$clientPackage = Get-Content "client/package.json" -Raw
if ($clientPackage -match "react") {
    Write-Host "✅ React frontend found" -ForegroundColor Green
} else {
    Write-Host "❌ React frontend not found" -ForegroundColor Red
    exit 1
}

# Test 7: Check for authentication implementation
Write-Host "Test 7: Checking for authentication implementation..." -ForegroundColor Yellow
$serverFiles = Get-ChildItem "server/src" -Recurse -File | Get-Content -Raw
if ($serverFiles -match "auth|login|register|jwt|token|password") {
    Write-Host "✅ Authentication implementation found" -ForegroundColor Green
} else {
    Write-Host "❌ Authentication implementation not found" -ForegroundColor Red
    exit 1
}

# Test 8: Check for testing setup
Write-Host "Test 8: Checking for testing setup..." -ForegroundColor Yellow
if (($clientPackage -match "test|jest|mocha|cypress|playwright") -or ($serverPackage -match "test|jest|mocha|cypress|playwright")) {
    Write-Host "✅ Testing setup found" -ForegroundColor Green
} else {
    Write-Host "❌ Testing setup not found" -ForegroundColor Red
    exit 1
}

# Test 9: Check for API endpoints
Write-Host "Test 9: Checking for API endpoints..." -ForegroundColor Yellow
if ($serverFiles -match "router|app\.get|app\.post|app\.put|app\.delete") {
    Write-Host "✅ API endpoints found" -ForegroundColor Green
} else {
    Write-Host "❌ API endpoints not found" -ForegroundColor Red
    exit 1
}

# Test 10: Check for deployment information
Write-Host "Test 10: Checking for deployment information..." -ForegroundColor Yellow
$readme = Get-Content "README.md" -Raw
if ($readme -match "deploy|vercel|netlify|heroku|render|railway|production|live") {
    Write-Host "✅ Deployment information found" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment information not found" -ForegroundColor Red
    exit 1
}

Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 All classroom tests passed!" -ForegroundColor Green
Write-Host "✅ Ready to push to GitHub!" -ForegroundColor Green 