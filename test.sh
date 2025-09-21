#!/bin/bash

echo "🎯 Job Crawler - Quick Commands"
echo ""

case "$1" in
    "mock")
        echo "📝 Creating mock jobs..."
        curl -X POST "http://localhost:3001/crawler/crawl/mock"
        echo ""
        ;;
    "crawl")
        echo "🤖 Triggering real crawl..."
        curl -X POST "http://localhost:3001/crawler/crawl?search=エンジニア&pages=2"
        echo ""
        ;;
    "jobs")
        echo "📋 Getting jobs list..."
        curl -s "http://localhost:3001/jobs" | jq '.data[] | {id, title, company: .company.name}' 2>/dev/null || curl "http://localhost:3001/jobs"
        echo ""
        ;;
    "stats")
        echo "📊 Getting statistics..."
        curl -s "http://localhost:3001/jobs/stats" | jq '.' 2>/dev/null || curl "http://localhost:3001/jobs/stats"
        echo ""
        ;;
    "job")
        if [ -z "$2" ]; then
            echo "Usage: $0 job <id>"
            exit 1
        fi
        echo "📄 Getting job details for ID: $2"
        curl -s "http://localhost:3001/jobs/$2" | jq '.' 2>/dev/null || curl "http://localhost:3001/jobs/$2"
        echo ""
        ;;
    "test")
        echo "🧪 Running full test..."
        echo "1. Creating mock jobs..."
        curl -X POST "http://localhost:3001/crawler/crawl/mock"
        echo ""
        echo ""
        echo "2. Getting jobs list..."
        curl -s "http://localhost:3001/jobs" | jq '.data[] | {id, title, company: .company.name}' 2>/dev/null || curl "http://localhost:3001/jobs"
        echo ""
        echo ""
        echo "3. Getting first job details..."
        curl -s "http://localhost:3001/jobs/1" | jq '.title, .company.name' 2>/dev/null || curl "http://localhost:3001/jobs/1"
        echo ""
        ;;
    *)
        echo "Commands:"
        echo "  $0 mock      - Create mock jobs for testing"
        echo "  $0 crawl     - Trigger real crawl from Indeed"
        echo "  $0 jobs      - List all jobs"
        echo "  $0 stats     - Get statistics"
        echo "  $0 job <id>  - Get job details"
        echo "  $0 test      - Run full test sequence"
        echo ""
        echo "Frontend: http://localhost:3000"
        echo "Backend:  http://localhost:3001"
        ;;
esac