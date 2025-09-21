#!/bin/bash

# ================================================================================
# Job Crawler Bulk Script - Crawl từ trang 1 đến trang 100
# ================================================================================

# Cấu hình
API_URL="http://localhost:3001"
SEARCH_QUERY="バックエンドエンジニア"
TOTAL_PAGES=100
PAGES_PER_BATCH=10  # Controller giới hạn 10 pages mỗi lần
DELAY_BETWEEN_BATCHES=30  # Delay 30 giây giữa các batch để tránh rate limit

# Màu sắc cho log
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Kiểm tra xem backend server có đang chạy không
check_backend() {
    log_info "Checking if backend server is running..."
    
    if curl -s -f "${API_URL}/jobs" > /dev/null 2>&1; then
        log_success "Backend server is running at $API_URL"
        return 0
    else
        log_error "Backend server is not running at $API_URL"
        log_info "Please start the backend server first with: cd backend && npm run start:dev"
        return 1
    fi
}

# Hàm thực hiện crawl một batch
crawl_batch() {
    local batch_num=$1
    local start_page=$2
    local end_page=$3
    
    log_info "Starting batch $batch_num (simulating pages $start_page-$end_page)..."
    
    # Gọi API crawl với $PAGES_PER_BATCH pages
    local response=$(curl -s -X POST "${API_URL}/crawler/crawl?search=${SEARCH_QUERY}&pages=${PAGES_PER_BATCH}" \
        -H "Content-Type: application/json" \
        2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Parse response để lấy số jobs đã crawl được
        local jobs_found=$(echo "$response" | grep -o '"jobsFound":[0-9]*' | cut -d':' -f2)
        local message=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        
        if [ ! -z "$jobs_found" ]; then
            log_success "Batch $batch_num completed - Found $jobs_found jobs"
            echo "$jobs_found"
        else
            log_warning "Batch $batch_num completed but couldn't parse job count"
            log_info "Response: $response"
            echo "0"
        fi
    else
        log_error "Batch $batch_num failed - API call error"
        echo "0"
    fi
}

# Hàm hiển thị progress bar
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "\r${BLUE}Progress:${NC} ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %d%% (%d/%d batches)" $percentage $current $total
}

# Main execution
main() {
    echo "=================================================================================="
    echo "🚀 Job Crawler Bulk Script"
    echo "=================================================================================="
    echo "Search Query: $SEARCH_QUERY"
    echo "Target Pages: 1-$TOTAL_PAGES (via $((TOTAL_PAGES / PAGES_PER_BATCH)) batches of $PAGES_PER_BATCH pages each)"
    echo "Delay between batches: ${DELAY_BETWEEN_BATCHES}s"
    echo "=================================================================================="
    
    # Kiểm tra backend
    if ! check_backend; then
        exit 1
    fi
    
    # Tính số batch cần thiết
    local total_batches=$((TOTAL_PAGES / PAGES_PER_BATCH))
    local total_jobs=0
    local successful_batches=0
    local start_time=$(date +%s)
    
    log_info "Starting bulk crawl with $total_batches batches..."
    echo ""
    
    # Loop qua từng batch
    for ((batch=1; batch<=total_batches; batch++)); do
        local start_page=$(((batch-1) * PAGES_PER_BATCH + 1))
        local end_page=$((batch * PAGES_PER_BATCH))
        
        # Hiển thị progress
        show_progress $((batch-1)) $total_batches
        
        # Thực hiện crawl batch
        local batch_jobs=$(crawl_batch $batch $start_page $end_page)
        
        if [ "$batch_jobs" != "0" ]; then
            total_jobs=$((total_jobs + batch_jobs))
            successful_batches=$((successful_batches + 1))
        fi
        
        # Delay giữa các batch (trừ batch cuối)
        if [ $batch -lt $total_batches ]; then
            log_info "Waiting ${DELAY_BETWEEN_BATCHES}s before next batch..."
            for ((i=DELAY_BETWEEN_BATCHES; i>0; i--)); do
                printf "\r${YELLOW}[WAIT]${NC} Next batch in %2ds..." $i
                sleep 1
            done
            printf "\r%*s\r" 30 ""  # Clear the wait message
        fi
    done
    
    # Hiển thị progress cuối
    show_progress $total_batches $total_batches
    echo ""
    echo ""
    
    # Tính thời gian hoàn thành
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    # Summary
    echo "=================================================================================="
    echo "📊 CRAWL SUMMARY"
    echo "=================================================================================="
    log_success "Bulk crawl completed!"
    echo "• Total batches processed: $successful_batches/$total_batches"
    echo "• Total jobs crawled: $total_jobs"
    echo "• Total time: ${minutes}m ${seconds}s"
    echo "• Success rate: $((successful_batches * 100 / total_batches))%"
    
    if [ $successful_batches -eq $total_batches ]; then
        log_success "All batches completed successfully! 🎉"
    else
        log_warning "Some batches failed. Check logs above for details."
    fi
    
    echo ""
    log_info "You can now view the crawled jobs at: http://localhost:3002"
    echo "=================================================================================="
}

# Script start
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi