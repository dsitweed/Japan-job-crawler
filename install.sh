#!/bin/bash

# Install script for Job Crawler project
echo "🚀 Installing dependencies for Job Crawler..."

# Check if we're in the correct directory
if [[ ! -f "docker-compose.yml" ]]; then
    echo "❌ Please run this script from the Job_crawler root directory"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [[ -f "package.json" ]]; then
    npm install
    if [[ $? -eq 0 ]]; then
        echo "✅ Backend dependencies installed successfully"
    else
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "❌ Backend package.json not found"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if [[ -f "package.json" ]]; then
    npm install
    if [[ $? -eq 0 ]]; then
        echo "✅ Frontend dependencies installed successfully"
    else
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "❌ Frontend package.json not found"
    exit 1
fi

cd ..

echo "🎉 All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Start database: docker-compose up -d"
echo "2. Start backend: cd backend && npm run start:dev"
echo "3. Start frontend: cd frontend && npm run dev"