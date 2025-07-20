# PowerShell Test Runner for RecipeShare Application

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Coverage
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🧪 Starting automated testing..." $Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-ColorOutput "✅ Node.js found: $nodeVersion" $Green
} catch {
    Write-ColorOutput "❌ Node.js is not installed. Please install Node.js first." $Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-ColorOutput "✅ npm found: $npmVersion" $Green
} catch {
    Write-ColorOutput "❌ npm is not installed. Please install npm first." $Red
    exit 1
}

Write-ColorOutput "📦 Installing dependencies..." $Yellow

# Install backend dependencies
if (-not $FrontendOnly) {
    Write-ColorOutput "Installing backend dependencies..." $Yellow
    Set-Location server
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to install backend dependencies" $Red
        exit 1
    }
    Set-Location ..
}

# Install frontend dependencies
if (-not $BackendOnly) {
    Write-ColorOutput "Installing frontend dependencies..." $Yellow
    Set-Location client
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to install frontend dependencies" $Red
        exit 1
    }
    Set-Location ..
}

Write-ColorOutput "🔧 Setting up test environment..." $Yellow

# Set test environment variables
$env:NODE_ENV = "test"
$env:MONGODB_URI_TEST = "mongodb://localhost:27017/recipe-share-test"
$env:JWT_SECRET = "test-secret-key"
$env:CI = "true"

$BackendTestResult = 0
$FrontendTestResult = 0

# Run backend tests
if (-not $FrontendOnly) {
    Write-ColorOutput "🧪 Running backend tests..." $Yellow
    Set-Location server
    
    if ($Coverage) {
        npm run test:coverage
    } else {
        npm run test:ci
    }
    $BackendTestResult = $LASTEXITCODE
    
    if ($BackendTestResult -eq 0) {
        Write-ColorOutput "✅ Backend tests passed!" $Green
    } else {
        Write-ColorOutput "❌ Backend tests failed!" $Red
    }
    
    Set-Location ..
}

# Run frontend tests
if (-not $BackendOnly) {
    Write-ColorOutput "🧪 Running frontend tests..." $Yellow
    Set-Location client
    
    if ($Coverage) {
        npm run test:coverage
    } else {
        npm run test:ci
    }
    $FrontendTestResult = $LASTEXITCODE
    
    if ($FrontendTestResult -eq 0) {
        Write-ColorOutput "✅ Frontend tests passed!" $Green
    } else {
        Write-ColorOutput "❌ Frontend tests failed!" $Red
    }
    
    Set-Location ..
}

Write-ColorOutput "📊 Test Results Summary:" $Yellow

if ($BackendTestResult -eq 0 -and $FrontendTestResult -eq 0) {
    Write-ColorOutput "🎉 All tests passed!" $Green
    if (-not $FrontendOnly) {
        Write-ColorOutput "✅ Backend: PASSED" $Green
    }
    if (-not $BackendOnly) {
        Write-ColorOutput "✅ Frontend: PASSED" $Green
    }
    exit 0
} else {
    Write-ColorOutput "💥 Some tests failed!" $Red
    if (-not $FrontendOnly -and $BackendTestResult -ne 0) {
        Write-ColorOutput "❌ Backend: FAILED" $Red
    }
    if (-not $BackendOnly -and $FrontendTestResult -ne 0) {
        Write-ColorOutput "❌ Frontend: FAILED" $Red
    }
    exit 1
} 