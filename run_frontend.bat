@echo off
echo 🚀 Propharm - Frontend Only Version
echo ====================================

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please run this script from the Frontend_Only_Version directory
    pause
    exit /b 1
)

echo.
echo 📋 Checking Prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✓ Node.js is installed
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
) else (
    echo ✓ npm is installed
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    ) else (
        echo ✓ Dependencies installed successfully
    )
) else (
    echo ✓ Dependencies already installed
)

REM Start development server
echo.
echo 🚀 Starting development server...
echo The app will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
echo ====================================
npm run dev

