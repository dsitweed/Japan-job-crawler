#!/bin/bash

# ================================================================================
# Crawl pages 1-100 with default search params
# ================================================================================

API_URL="http://localhost:3001"
START_PAGE=1
END_PAGE=100
DELAY=3  # seconds between requests

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Bulk Crawler - Pages $START_PAGE to $END_PAGE"
echo "================================"
echo "API URL: $API_URL"
echo "Delay between requests: ${DELAY}s"
echo "================================"

# Check backend
if ! curl -s -f "${API_URL}/jobs" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend not running!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend ready${NC}"

total_jobs=0
successful_pages=0
start_time=$(date +%s)

for page in $(seq $START_PAGE $END_PAGE); do
    printf "Page %3d/%d: " $page $END_PAGE
    
    # POST request chỉ với parameter pages
    response=$(curl -s -X POST "${API_URL}/crawler/crawl?pages=1" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        jobs_found=$(echo "$response" | grep -o '"jobsFound":[0-9]*' | cut -d':' -f2)
        
        if [ ! -z "$jobs_found" ] && [ "$jobs_found" -gt 0 ]; then
            echo -e "${GREEN}✅ $jobs_found jobs${NC}"
            total_jobs=$((total_jobs + jobs_found))
            successful_pages=$((successful_pages + 1))
        else
            echo -e "${YELLOW}⚠️  0 jobs${NC}"
        fi
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
    
    # Progress indicator
    if [ $((page % 10)) -eq 0 ]; then
        elapsed=$(($(date +%s) - start_time))
        echo -e "${BLUE}--- Progress: $page/$END_PAGE pages, $total_jobs total jobs, ${elapsed}s elapsed ---${NC}"
    fi
    
    sleep $DELAY
done

# Final summary
end_time=$(date +%s)
duration=$((end_time - start_time))
minutes=$((duration / 60))
seconds=$((duration % 60))

echo "================================"
echo -e "${BLUE}📊 FINAL SUMMARY${NC}"
echo "Pages processed: $successful_pages/$END_PAGE"
echo "Total jobs: $total_jobs"
echo "Time: ${minutes}m ${seconds}s"
echo "Success rate: $((successful_pages * 100 / END_PAGE))%"
echo "================================"