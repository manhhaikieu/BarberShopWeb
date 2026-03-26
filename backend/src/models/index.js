const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Chair = require('./Chair')(sequelize);
const Barber = require('./Barber')(sequelize);
const Service = require('./Service')(sequelize);
const Booking = require('./Booking')(sequelize);
const BookingService = require('./BookingService')(sequelize);
const Product = require('./Product')(sequelize);
const ProductSale = require('./ProductSale')(sequelize);

// ── Quan hệ Chair ──────────────────────────────────────
Chair.hasOne(Barber, { foreignKey: 'chairId', as: 'barber' });
Barber.belongsTo(Chair, { foreignKey: 'chairId', as: 'chair' });

// ── Quan hệ Booking ────────────────────────────────────
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Chair.hasMany(Booking, { foreignKey: 'chairId', as: 'bookings' });
Booking.belongsTo(Chair, { foreignKey: 'chairId', as: 'chair' });

Barber.hasMany(Booking, { foreignKey: 'barberId', as: 'bookings' });
Booking.belongsTo(Barber, { foreignKey: 'barberId', as: 'barber' });

// ── Quan hệ Booking - Service (nhiều-nhiều) ────────────
Booking.belongsToMany(Service, {
  through: BookingService,
  foreignKey: 'bookingId',
  as: 'services',
});
Service.belongsToMany(Booking, {
  through: BookingService,
  foreignKey: 'serviceId',
  as: 'bookings',
});
BookingService.belongsTo(Booking, { foreignKey: 'bookingId' });
BookingService.belongsTo(Service, { foreignKey: 'serviceId' });

// ── Quan hệ ProductSale ────────────────────────────────
Product.hasMany(ProductSale, { foreignKey: 'productId', as: 'sales' });
ProductSale.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(ProductSale, { foreignKey: 'userId', as: 'productSales' });
ProductSale.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Quan hệ User - Barber (Thợ thuộc về một User) ────────
User.hasOne(Barber, { foreignKey: 'userId', as: 'barberProfile' });
Barber.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Chair,
  Barber,
  Service,
  Booking,
  BookingService,
  Product,
  ProductSale,
};
