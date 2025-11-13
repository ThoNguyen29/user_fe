# Frontend-Only Version - Quick Start Script
# PowerShell script to run the frontend-only version

Write-Host "🚀 Propharm - Frontend Only Version" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the Frontend_Only_Version directory" -ForegroundColor Yellow
    exit 1
}

# Check Node.js version
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion is installed" -ForegroundColor Green
    
    # Check if version is >= 16
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 16) {
        Write-Host "⚠️  Warning: Node.js version should be 16 or higher" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 16+ from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion is installed" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Start development server
Write-Host "`n🚀 Starting development server..." -ForegroundColor Yellow
Write-Host "The app will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "`n====================================" -ForegroundColor Green

npm run dev

