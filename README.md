# Job Crawler - IT Jobs from Indeed Japan

Dự án cào thông tin job từ jp.indeed.com và hiển thị trên web interface chuyên cho developer IT.

## 🎯 Tính năng

- 🔍 **Cào dữ liệu thông minh**: Tự động cào thông tin jobs từ jp.indeed.com với phân tích AI
- 📊 **Dashboard tương tác**: Bảng hiển thị jobs với tìm kiếm, lọc theo công ty, ngành nghề
- 📋 **Chi tiết job đầy đủ**: Trang hiển thị thông tin chi tiết theo format phân tích chuyên sâu
- 🏢 **Phân tích công ty**: AI phân tích ngành nghề, tech stack, văn hóa công ty
- 🔗 **Link gốc**: Truy cập trực tiếp đến job posting gốc trên Indeed
- � **UI/UX thân thiện**: Interface tiếng Việt, responsive design

## 🛠 Tech Stack

- **Backend**: NestJS + TypeORM + PostgreSQL + Puppeteer
- **Frontend**: NextJS + TypeScript + TailwindCSS
- **Crawler**: Puppeteer + Cheerio với AI analysis
- **Database**: PostgreSQL + Redis
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

1. **Clone và setup:**
   ```bash
   git clone <repo-url>
   cd Job_crawler
   ./setup.sh
   ```

2. **Khởi động development:**
   ```bash
   # Terminal 1: Database
   docker-compose up -d
   
   # Terminal 2: Backend API
   cd backend && npm run start:dev
   
   # Terminal 3: Frontend
   cd frontend && npm run dev
   ```

3. **Truy cập ứng dụng:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Cấu trúc dự án

```
Job_crawler/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── jobs/           # Job & Company entities, services
│   │   ├── crawler/        # Web crawler với AI analysis
│   │   └── main.ts
│   ├── package.json
│   └── .env
├── frontend/               # NextJS web interface
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/          # API client & utilities
│   ├── package.json
│   └── .env.local
├── docker-compose.yml     # PostgreSQL + Redis
├── setup.sh              # Auto setup script
└── README.md
```

## 🔧 API Endpoints

### Jobs API
- `GET /jobs` - Lấy danh sách jobs với filters
- `GET /jobs/:id` - Chi tiết job
- `GET /jobs/stats` - Thống kê jobs

### Crawler API
- `POST /crawler/crawl?search=エンジニア&pages=3` - Trigger crawl
- `GET /crawler/status` - Trạng thái crawler

## 🌐 Frontend Routes

- `/` - Dashboard với bảng jobs, tìm kiếm, lọc
- `/jobs/:id` - Trang chi tiết job với phân tích đầy đủ

## 📊 Database Schema

### Jobs Table
- Job information: title, description, location, salary
- Requirements: experience, skills, languages
- Benefits: work style, welfare
- Link to original Indeed URL

### Companies Table
- Company analysis: industry, type, culture
- Technology stack: backend, frontend, infrastructure
- Characteristics: size, work environment

## 🤖 AI Job Analysis

Crawler tự động phân tích và extract:
- **Ngành nghề**: Phân loại theo industry (IT/AI, SaaS, etc.)
- **Loại công ty**: Startup, Enterprise, Mid-size
- **Tech stack**: Backend/Frontend technologies
- **Văn hóa**: Remote work, flexible time, learning support
- **Yêu cầu**: Experience level, skills, languages
- **Phúc lợi**: Salary range, benefits, work conditions

## 🔍 Sample Job Analysis Format

```
🏢 株式会社Sportip (Sportip Inc.)

* **Ngành lớn**: IT / インターネット / ヘルスケア・AI
* **Ngành nhỏ**: AI × 動作解析 / BtoB SaaS
* **Đặc trưng**: Startup – AI phân tích động tác

💻 Tech Stack:
* **Backend**: Node.js, Python, API開発
* **Frontend**: React, Next.js
* **Infrastructure**: AWS, Docker

👥 Văn hóa:
* Startup environment, tự chủ cao
* Remote work, flexible time
* Learning & development support

💴 Lương: 800万円 〜 1,200万円 (年収)

🎯 URL gốc: https://jp.indeed.com/viewjob?jk=xxx
```

## 🛠 Development

Xem [DEVELOPMENT.md](./DEVELOPMENT.md) để biết chi tiết về development workflow, API testing, và troubleshooting.

## 📝 Notes

- Web crawler tuân thủ robots.txt và rate limiting
- Dữ liệu được cache để tối ưu performance
- Support responsive design cho mobile
- Interface hoàn toàn tiếng Việt

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License