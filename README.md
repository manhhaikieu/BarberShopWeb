# BarberShopWeb

Fullstack barber shop management and booking application.

## Tech Stack

- Frontend: React (Create React App), React Router
- Backend: Node.js, Express, Sequelize
- Database: MySQL
- Auth: JWT
- Testing: Jest, Supertest (backend)

## Project Structure

```text
BarberShopWeb/
  backend/     # REST API + business logic + DB models
  frontend/    # React client app
```

## Main Features

- User registration, login, profile update
- JWT-based authentication and role/permission checks
- Booking management (create, list, status update, cancel)
- Services management
- Products management and product orders
- Barbers and chairs management
- Product image upload endpoint
- Admin and barber dashboard pages in frontend

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+ (or compatible)

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=barbershop
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Optional: create `frontend/.env` if your API is not on localhost:5000.

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Install Dependencies

From the repository root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run In Development

1. Start backend:

```bash
cd backend
npm run dev
```

Backend health check: `http://localhost:5000/api/health`

2. Start frontend (new terminal):

```bash
cd frontend
npm start
```

Frontend: `http://localhost:3000`

## Database Setup

- Ensure MySQL is running.
- Create database `barbershop` (or match your `.env` value).
- Start backend once to let Sequelize sync models.

Run seed data (optional):

```bash
cd backend
npm run seed
```

## Test

Backend tests:

```bash
cd backend
npm test
```

Coverage report:

```bash
cd backend
npm run test:coverage
```

## API Base Routes

- `/api/auth`
- `/api/bookings`
- `/api/services`
- `/api/products`
- `/api/product-orders`
- `/api/barbers`
- `/api/chairs`
- `/api/upload`

## Deployment Notes

- Set secure production values for all env vars, especially `JWT_SECRET`.
- Configure CORS in backend for your frontend domain.
- Use a production MySQL instance and backups.

## License

MIT (or your preferred license)
