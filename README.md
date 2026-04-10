# BarberShopWeb

## Đây Là Gì?

Đây là dự án BarberShopWeb, một hệ thống quản lý tiệm tóc theo mô hình fullstack. Trong dự án này, tôi phụ trách backend (REST API + nghiệp vụ + kết nối database).

Hệ thống gồm:

- Frontend cho khách hàng, thợ cắt tóc và admin thao tác trên giao diện web
- Backend REST API xử lý nghiệp vụ đặt lịch, sản phẩm, tài khoản và phân quyền
- Database MySQL lưu trữ toàn bộ dữ liệu

## Để Làm Gì?

Mục tiêu của dự án là số hóa quy trình vận hành barber shop:

- Khách hàng đăng ký, đăng nhập, cập nhật thông tin
- Đặt lịch cắt tóc, theo dõi lịch hẹn, hủy lịch
- Quản lý dịch vụ, sản phẩm, đơn hàng sản phẩm
- Quản lý thợ cắt tóc và ghế
- Phân quyền theo vai trò (customer, staff, barber, admin)

## Công Nghệ Sử Dụng

- Frontend: React (Create React App), React Router
- Backend: Node.js, Express, Sequelize
- Database: MySQL
- Xác thực: JWT
- Test backend: Jest, Supertest

## Cấu Trúc Dự Án

```text
BarberShopWeb/
  backend/     # REST API + business logic + DB models
  frontend/    # React client app
```

## Điều Kiện Cần

- Node.js 18 trở lên
- npm 9 trở lên
- MySQL 8 trở lên (hoặc tương thích)

## Cách Chạy Local

1. Cài dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Chạy backend

```bash
cd backend
npm run dev
```

Health check API: http://localhost:5000/api/health

3. Chạy frontend (terminal mới)

```bash
cd frontend
npm start
```

Truy cập giao diện: http://localhost:3000

## Database Setup

- Đảm bảo MySQL đang chạy
- Tạo database tên barbershop
- Chạy backend để Sequelize tự động sync bảng

Seed dữ liệu mẫu (tùy chọn):

```bash
cd backend
npm run seed
```

## Test

Chạy test backend:

```bash
cd backend
npm test
```

Báo cáo độ bao phủ:

```bash
cd backend
npm run test:coverage
```

## Deploy Ở Đâu?

Có thể deploy theo cách tách frontend và backend:

- Frontend (React): Vercel, Netlify, Firebase Hosting
- Backend (Node.js): Render, Railway, Fly.io, VPS
- Database MySQL: Aiven, PlanetScale (MySQL-compatible), Railway MySQL, VPS

Gợi ý nhanh:

1. Deploy backend trước, lấy URL API production
2. Cấu hình frontend gọi đúng API production + /api
3. Cấu hình CORS backend cho domain frontend
4. Bảo mật thông tin cấu hình production và tài khoản database

## Vai Trò Của Tôi Trong Dự Án

Tôi đang làm backend cho dự án này, cụ thể:

- Thiết kế và phát triển REST API
- Xử lý logic đặt lịch, sản phẩm, đơn hàng, tài khoản
- Xây dựng xác thực JWT và phân quyền theo vai trò
- Quản lý model/database với Sequelize + MySQL
- Hỗ trợ deploy backend và kết nối với frontend

## Các API Route Chính

- /api/auth
- /api/bookings
- /api/services
- /api/products
- /api/product-orders
- /api/barbers
- /api/chairs
- /api/upload

## License

MIT (hoặc thay bằng license bạn sử dụng)
