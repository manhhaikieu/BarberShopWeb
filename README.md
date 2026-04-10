# BarberShopWeb

## Day La Gi?

Day la du an BarberShopWeb, mot he thong quan ly tiem toc theo mo hinh fullstack. Trong du an nay, toi phu trach backend (REST API + nghiep vu + ket noi database).

He thong gom:

- Frontend cho khach hang, tho cat toc va admin thao tac tren giao dien web
- Backend REST API xu ly nghiep vu dat lich, san pham, tai khoan va phan quyen
- Database MySQL luu tru toan bo du lieu

## De Lam Gi?

Muc tieu cua du an la so hoa quy trinh van hanh barber shop:

- Khach hang dang ky, dang nhap, cap nhat thong tin
- Dat lich cat toc, theo doi lich hen, huy lich
- Quan ly dich vu, san pham, don hang san pham
- Quan ly tho cat toc va ghe
- Phan quyen theo vai tro (customer, staff, barber, admin)

## Cong Nghe Su Dung

- Frontend: React (Create React App), React Router
- Backend: Node.js, Express, Sequelize
- Database: MySQL
- Xac thuc: JWT
- Test backend: Jest, Supertest

## Cau Truc Du An

```text
BarberShopWeb/
  backend/     # REST API + business logic + DB models
  frontend/    # React client app
```

## Dieu Kien Can

- Node.js 18 tro len
- npm 9 tro len
- MySQL 8 tro len (hoac tuong thich)

## Cach Chay Local

1. Cai dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Chay backend

```bash
cd backend
npm run dev
```

Health check API: http://localhost:5000/api/health

3. Chay frontend (terminal moi)

```bash
cd frontend
npm start
```

Truy cap giao dien: http://localhost:3000

## Database Setup

- Dam bao MySQL dang chay
- Tao database ten barbershop
- Chay backend de Sequelize tu dong sync bang

Seed du lieu mau (tuy chon):

```bash
cd backend
npm run seed
```

## Test

Chay test backend:

```bash
cd backend
npm test
```

Bao cao do bao phu:

```bash
cd backend
npm run test:coverage
```

## Deploy O Dau?

Co the deploy theo cach tach frontend va backend:

- Frontend (React): Vercel, Netlify, Firebase Hosting
- Backend (Node.js): Render, Railway, Fly.io, VPS
- Database MySQL: Aiven, PlanetScale (MySQL-compatible), Railway MySQL, VPS

Goi y nhanh:

1. Deploy backend truoc, lay URL API production
2. Cau hinh frontend goi dung API production + /api
3. Cau hinh CORS backend cho domain frontend
4. Bao mat thong tin cau hinh production va tai khoan database

## Vai Tro Cua Toi Trong Du An

Toi dang lam backend cho du an nay, cu the:

- Thiet ke va phat trien REST API
- Xu ly logic dat lich, san pham, don hang, tai khoan
- Xay dung xac thuc JWT va phan quyen theo vai tro
- Quan ly model/database voi Sequelize + MySQL
- Ho tro deploy backend va ket noi voi frontend

## Cac API Route Chinh

- /api/auth
- /api/bookings
- /api/services
- /api/products
- /api/product-orders
- /api/barbers
- /api/chairs
- /api/upload

## License

MIT (hoac thay bang license ban su dung)
