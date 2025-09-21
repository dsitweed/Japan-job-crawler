# 🎉 Crawler Japan Job from Indeed Project 

## 🚀 Cách chạy dự án:

### 1. Khởi động Database
```bash
docker-compose up -d
```

### 2. Khởi động Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```
✅ Backend sẽ chạy tại: http://localhost:3001

### 3. Khởi động Frontend (Terminal 2)  
```bash
cd frontend
npm run dev
```
✅ Frontend sẽ chạy tại: http://localhost:3000

## 🎯 Tính năng đã hoàn thành:

### Frontend (NextJS)
- ✅ **Dashboard Page** - Bảng hiển thị jobs với search, filter, pagination
- ✅ **Job Detail Page** - Hiển thị chi tiết job theo format mẫu bạn yêu cầu
- ✅ **Responsive Design** - TailwindCSS mobile-friendly
- ✅ **API Integration** - Kết nối với backend API

### Backend (NestJS)
- ✅ **Jobs API** - CRUD operations cho jobs
- ✅ **Companies API** - Quản lý thông tin công ty
- ✅ **Crawler Service** - Cào dữ liệu từ jp.indeed.com
- ✅ **AI Analysis** - Phân tích tự động ngành nghề, tech stack, văn hóa
- ✅ **Database** - PostgreSQL với TypeORM

### Database
- ✅ **Jobs Table** - Lưu thông tin job đầy đủ
- ✅ **Companies Table** - Phân tích công ty chi tiết
- ✅ **Relationships** - Foreign keys và indexing tối ưu

## 🌐 Truy cập ứng dụng:

1. **Frontend Dashboard**: http://localhost:3000
   - Xem danh sách jobs
   - Tìm kiếm, lọc theo công ty/ngành nghề
   - Click vào job để xem chi tiết

2. **Job Detail Page**: http://localhost:3000/jobs/:id
   - Hiển thị theo format mẫu bạn cung cấp
   - Phân tích công ty đầy đủ
   - Link gốc đến Indeed

## 🤖 Test Crawler:

1. Vào dashboard: http://localhost:3000
2. Click nút **"Crawl mới"** 
3. Hệ thống sẽ cào jobs từ jp.indeed.com
4. Jobs sẽ xuất hiện trong bảng sau khi crawl xong

## 📊 API Endpoints:

```bash
# Get all jobs with filters
GET http://localhost:3001/jobs?search=React&page=1&limit=10

# Get job detail
GET http://localhost:3001/jobs/1

# Get statistics
GET http://localhost:3001/jobs/stats

# Trigger crawl
POST http://localhost:3001/crawler/crawl?search=エンジニア&pages=3

# Crawler status
GET http://localhost:3001/crawler/status
```

## 📋 Ví dụ Job Detail Format:

Trang chi tiết job hiển thị chính xác theo mẫu bạn yêu cầu:

```
🏢 株式会社Sportip (Sportip Inc.)

* **Ngành lớn**: IT / インターネット / ヘルスケア・AI
* **Ngành nhỏ**: AI × 動作解析 / BtoB SaaS / 健康・介護・スポーツ関連サービス  
* **Đặc trưng**: **Startup** – phát triển các sản phẩm AI dựa trên phân tích động作姿勢

💻 **Công nghệ / Môi trường phát triển**
* **Backend**: Webアプリケーションサーバーサイド, API開発
* **Frontend**: Next.js / React
* **CI/CD**: pipeline thiết lập và tối ưu hóa

👥 **Quy mô tổ chức**
* **Nhân sự**: ~40 người
* **Văn hóa**: startup nhỏ, linh hoạt, tự do về giờ làm

💴 **Lương / Điều kiện**
* **Mức lương**: 年収 800万円 ~ 1,200万円 (~67~100万/tháng)
* **Hình thức**: 正社員
* **Phúc lợi**: 社会保険完備, 完全週休2日制, 冬季休業

🎯 **URL gốc của Job**:
https://jp.indeed.com/viewjob?jk=8a9eb059f0aef2f7&from=shareddesktop_copy
```

## 🔧 Troubleshooting:

### Database không kết nối được:
```bash
docker-compose down
docker-compose up -d
```

### Port đã được sử dụng:
- Backend: Đổi PORT trong `.env` file
- Frontend: Thêm `-p 3001` vào command `npm run dev`

## 🎊 Kết quả đạt được:

✅ **Hoàn thành 100% yêu cầu**:
- ✅ FE: NextJS với TypeScript + TailwindCSS
- ✅ BE: NestJS với TypeORM + PostgreSQL  
- ✅ Crawler: Puppeteer cào jp.indeed.com
- ✅ Dashboard: Bảng jobs với search/filter
- ✅ Job Detail: Format chính xác như mẫu
- ✅ Analysis: Tự động phân tích công ty
- ✅ Link gốc: Truy cập job trên Indeed
- 