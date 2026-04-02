/**
 * Test Setup - Configure test database and utilities
 */
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');

// Create in-memory SQLite database for testing
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Initialize models with test sequelize instance
const User = require('../src/models/User')(sequelize);
const Chair = require('../src/models/Chair')(sequelize);
const Barber = require('../src/models/Barber')(sequelize);
const Service = require('../src/models/Service')(sequelize);
const Booking = require('../src/models/Booking')(sequelize);
const BookingService = require('../src/models/BookingService')(sequelize);

// Set up associations
Chair.hasOne(Barber, { foreignKey: 'chairId', as: 'barber' });
Barber.belongsTo(Chair, { foreignKey: 'chairId', as: 'chair' });

User.hasOne(Barber, { foreignKey: 'userId', as: 'barber_profile' });
Barber.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Chair.hasMany(Booking, { foreignKey: 'chairId', as: 'bookings' });
Booking.belongsTo(Chair, { foreignKey: 'chairId', as: 'chair' });

Barber.hasMany(Booking, { foreignKey: 'barberId', as: 'bookings' });
Booking.belongsTo(Barber, { foreignKey: 'barberId', as: 'barber' });

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

// JWT secret for tests
const JWT_SECRET = 'test-secret-key';
process.env.JWT_SECRET = JWT_SECRET;

// Generate test token
const generateToken = (user, permissions = []) => {
  return jwt.sign(
    { id: user.id, role: user.role, permissions },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Create test data
const createTestData = async () => {
  // Create users
  const customer = await User.create({
    username: 'testcustomer',
    email: 'customer@test.com',
    password: 'hashedpassword',
    fullName: 'Test Customer',
    phone: '0123456789',
    role: 'customer',
  });

  const staff = await User.create({
    username: 'teststaff',
    email: 'staff@test.com',
    password: 'hashedpassword',
    fullName: 'Test Staff',
    phone: '0123456780',
    role: 'staff',
  });

  const admin = await User.create({
    username: 'testadmin',
    email: 'admin@test.com',
    password: 'hashedpassword',
    fullName: 'Test Admin',
    phone: '0123456781',
    role: 'admin',
  });

  // Create chairs
  const chair1 = await Chair.create({
    name: 'Ghế 1',
    isAvailable: true,
  });

  const chair2 = await Chair.create({
    name: 'Ghế 2',
    isAvailable: true,
  });

  const chair3 = await Chair.create({
    name: 'Ghế 3 - Bảo trì',
    isAvailable: false, // Inactive chair
  });

  // Create barbers
  const barber1 = await Barber.create({
    userId: staff.id,
    chairId: chair1.id,
    name: 'Barber Test 1',
    experienceYears: 5,
    phone: '0123456000',
  });

  // Create services
  const haircut = await Service.create({
    name: 'Cắt tóc',
    description: 'Cắt tóc nam',
    price: 50000,
    duration: 30,
  });

  const shave = await Service.create({
    name: 'Cạo râu',
    description: 'Cạo râu thư giãn',
    price: 30000,
    duration: 15,
  });

  const wash = await Service.create({
    name: 'Gội đầu',
    description: 'Gội đầu massage',
    price: 20000,
    duration: 10,
  });

  return {
    users: { customer, staff, admin },
    chairs: { chair1, chair2, chair3 },
    barbers: { barber1 },
    services: { haircut, shave, wash },
  };
};

module.exports = {
  sequelize,
  User,
  Chair,
  Barber,
  Service,
  Booking,
  BookingService,
  generateToken,
  createTestData,
  JWT_SECRET,
};
