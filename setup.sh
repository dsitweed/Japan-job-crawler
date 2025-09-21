#!/bin/bash

# Job Crawler Setup Script
echo "🚀 Setting up Job Crawler project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites checked"

# Start database services
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

cd ..

echo "✅ Setup completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the backend: cd backend && npm run start:dev"
echo "2. Start the frontend: cd frontend && npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Trigger job crawling via: POST http://localhost:3001/crawler/crawl"
echo ""
echo "📚 API Endpoints:"
echo "- GET  http://localhost:3001/jobs - List jobs"
echo "- GET  http://localhost:3001/jobs/stats - Job statistics"
echo "- POST http://localhost:3001/crawler/crawl - Trigger crawling"
echo ""
echo "Happy coding! 🎉"