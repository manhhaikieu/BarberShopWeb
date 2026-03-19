require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

const authRoutes = require('./src/routes/auth');
const bookingRoutes = require('./src/routes/bookings');
const serviceRoutes = require('./src/routes/services');
const productRoutes = require('./src/routes/products');
const barberRoutes = require('./src/routes/barbers');
const chairRoutes = require('./src/routes/chairs');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/chairs', chairRoutes);

// ── Health check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'BarberShop API is running' });
});

// ── 404 handler ────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Route không tồn tại' });
});

// ── Start server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize
    .authenticate()
    .then(() => {
        console.log('✅ Database kết nối thành công');
        return sequelize.sync({ alter: false });
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
            console.log(`📋 API docs: http://localhost:${PORT}/api/health`);
        });
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối database:', err);
        process.exit(1);
    });

module.exports = app;
