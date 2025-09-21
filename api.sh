#!/bin/bash

# Job Crawler API Script
echo "🤖 Job Crawler API Commands"

API_BASE="http://localhost:3001"

# Function to check if backend is running
check_backend() {
    echo "🔍 Checking backend status..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/crawler/status" 2>/dev/null)
    if [ "$response" = "200" ]; then
        echo "✅ Backend is running"
        return 0
    else
        echo "❌ Backend is not running. Please start backend first:"
        echo "   cd backend && npm run start:dev"
        return 1
    fi
}

# Function to trigger crawling
crawl_jobs() {
    local search_term=${1:-"エンジニア"}
    local pages=${2:-3}
    
    echo "🚀 Starting job crawling..."
    echo "   Search term: $search_term"
    echo "   Pages: $pages"
    
    response=$(curl -s -X POST "$API_BASE/crawler/crawl?search=$search_term&pages=$pages")
    
    if [ $? -eq 0 ]; then
        echo "✅ Crawl request sent successfully!"
        echo "📊 Response: $response"
    else
        echo "❌ Failed to send crawl request"
    fi
}

# Function to get job statistics
get_stats() {
    echo "📊 Getting job statistics..."
    response=$(curl -s "$API_BASE/jobs/stats")
    
    if [ $? -eq 0 ]; then
        echo "✅ Statistics retrieved:"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo "❌ Failed to get statistics"
    fi
}

# Function to list jobs
list_jobs() {
    local limit=${1:-10}
    echo "📋 Listing recent $limit jobs..."
    response=$(curl -s "$API_BASE/jobs?limit=$limit")
    
    if [ $? -eq 0 ]; then
        echo "✅ Jobs retrieved:"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo "❌ Failed to get jobs"
    fi
}

# Main menu
case "$1" in
    "check")
        check_backend
        ;;
    "crawl")
        if check_backend; then
            crawl_jobs "$2" "$3"
        fi
        ;;
    "stats")
        if check_backend; then
            get_stats
        fi
        ;;
    "list")
        if check_backend; then
            list_jobs "$2"
        fi
        ;;
    "test")
        echo "🧪 Running full test sequence..."
        if check_backend; then
            echo ""
            echo "1. Getting current stats..."
            get_stats
            echo ""
            echo "2. Triggering crawl..."
            crawl_jobs "エンジニア" "2"
            echo ""
            echo "3. Waiting 30 seconds for crawl to complete..."
            sleep 30
            echo ""
            echo "4. Getting updated stats..."
            get_stats
            echo ""
            echo "5. Listing recent jobs..."
            list_jobs "5"
        fi
        ;;
    *)
        echo "Usage: $0 {check|crawl|stats|list|test}"
        echo ""
        echo "Commands:"
        echo "  check                    - Check if backend is running"
        echo "  crawl [term] [pages]     - Trigger job crawling (default: エンジニア, 3 pages)"
        echo "  stats                    - Get job statistics"
        echo "  list [limit]             - List recent jobs (default: 10)"
        echo "  test                     - Run full test sequence"
        echo ""
        echo "Examples:"
        echo "  $0 check"
        echo "  $0 crawl"
        echo "  $0 crawl 'React' 5"
        echo "  $0 stats"
        echo "  $0 list 20"
        echo "  $0 test"
        ;;
esac