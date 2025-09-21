# Job Crawler Development Scripts

## Backend Scripts
```bash
# Start backend development server
cd backend && npm run start:dev

# Build backend
cd backend && npm run build

# Run tests
cd backend && npm run test
```

## Frontend Scripts
```bash
# Start frontend development server
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Start production frontend
cd frontend && npm run start
```

## Database Scripts
```bash
# Start database services
docker-compose up -d postgres redis

# Stop database services
docker-compose down

# View database logs
docker-compose logs postgres

# Connect to database
docker exec -it job_crawler_db psql -U postgres -d job_crawler
```

## Crawler Scripts
```bash
# Trigger manual crawl via API
curl -X POST "http://localhost:3001/crawler/crawl?search=エンジニア&pages=3"

# Get crawler status
curl "http://localhost:3001/crawler/status"

# Get job statistics
curl "http://localhost:3001/jobs/stats"
```

## Development Workflow

1. **First time setup:**
   ```bash
   ./setup.sh
   ```

2. **Daily development:**
   ```bash
   # Terminal 1: Start database
   docker-compose up -d
   
   # Terminal 2: Start backend
   cd backend && npm run start:dev
   
   # Terminal 3: Start frontend
   cd frontend && npm run dev
   ```

3. **Testing the crawler:**
   - Open http://localhost:3000
   - Click "Crawl mới" button
   - Wait for jobs to be crawled and saved
   - Browse jobs in the dashboard

## API Testing

```bash
# Get all jobs
curl "http://localhost:3001/jobs"

# Get job by ID
curl "http://localhost:3001/jobs/1"

# Get jobs with search filter
curl "http://localhost:3001/jobs?search=React&page=1&limit=10"

# Get statistics
curl "http://localhost:3001/jobs/stats"
```