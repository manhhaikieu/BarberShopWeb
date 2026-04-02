/**
 * Booking API Tests
 * Test all booking scenarios for haircut appointments
 */
const request = require('supertest');
const express = require('express');
const {
  sequelize,
  User,
  Chair,
  Barber,
  Service,
  Booking,
  BookingService,
  generateToken,
  createTestData,
} = require('./setup');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock the models module
jest.mock('../src/models', () => ({
  sequelize: require('./setup').sequelize,
  User: require('./setup').User,
  Chair: require('./setup').Chair,
  Barber: require('./setup').Barber,
  Service: require('./setup').Service,
  Booking: require('./setup').Booking,
  BookingService: require('./setup').BookingService,
}));

// Import routes after mocking
const bookingRoutes = require('../src/routes/bookings');
app.use('/api/bookings', bookingRoutes);

// Test data holders
let testData;
let customerToken;
let staffToken;
let adminToken;

describe('Booking API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    testData = await createTestData();

    // Generate tokens with appropriate permissions
    customerToken = generateToken(testData.users.customer, ['CreateBooking', 'ViewBooking']);
    staffToken = generateToken(testData.users.staff, ['CreateBooking', 'ViewBooking', 'ManageBooking']);
    adminToken = generateToken(testData.users.admin, ['CreateBooking', 'ViewBooking', 'ManageBooking']);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear bookings before each test
    await BookingService.destroy({ where: {} });
    await Booking.destroy({ where: {} });
  });

  // ══════════════════════════════════════════════════════════════
  // 1. HAPPY PATH - Successful Booking Scenarios
  // ══════════════════════════════════════════════════════════════

  describe('✅ Happy Path - Successful Bookings', () => {

    test('1.1 Đặt lịch cơ bản với 1 dịch vụ', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Đặt lịch thành công');
      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.status).toBe('pending');
      expect(parseFloat(response.body.booking.totalPrice)).toBe(50000);
    });

    test('1.2 Đặt lịch với nhiều dịch vụ (combo)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [
            testData.services.haircut.id,
            testData.services.shave.id,
            testData.services.wash.id,
          ],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(201);
      // Total price: 50000 + 30000 + 20000 = 100000
      expect(parseFloat(response.body.booking.totalPrice)).toBe(100000);
      // Total duration: 30 + 15 + 10 = 55 minutes
      const start = new Date(response.body.booking.startTime);
      const end = new Date(response.body.booking.endTime);
      const durationMinutes = (end - start) / (1000 * 60);
      expect(durationMinutes).toBe(55);
    });

    test('1.3 Đặt lịch với ghi chú', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair2.id,
          note: 'Cắt kiểu undercut, không cần gội',
        });

      expect(response.status).toBe(201);
      expect(response.body.booking.note).toBe('Cắt kiểu undercut, không cần gội');
    });

    test('1.4 Tự động gán thợ khi đặt ghế có barber', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id, // Chair 1 has barber1 assigned
        });

      expect(response.status).toBe(201);
      expect(response.body.booking.barberId).toBe(testData.barbers.barber1.id);
    });

    test('1.5 Đặt lịch ghế không có thợ (barberId = null)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(15, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair2.id, // Chair 2 has no barber
        });

      expect(response.status).toBe(201);
      expect(response.body.booking.barberId).toBeNull();
    });

    test('1.6 Đặt lịch và chỉ định thợ cụ thể', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(16, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair2.id,
          barberId: testData.barbers.barber1.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.booking.barberId).toBe(testData.barbers.barber1.id);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 2. VALIDATION ERRORS - Missing/Invalid Fields
  // ══════════════════════════════════════════════════════════════

  describe('❌ Validation Errors', () => {

    test('2.1 Thiếu serviceIds - trả về 400', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    test('2.2 serviceIds rỗng - trả về 400', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(400);
    });

    test('2.3 startTime không đúng định dạng ISO8601', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: '2024/01/15 10:00', // Invalid format
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(400);
    });

    test('2.4 Thiếu chairId - trả về 400', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
        });

      expect(response.status).toBe(400);
    });

    test('2.5 Service ID không tồn tại - trả về 404', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [9999], // Non-existent service
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('dịch vụ không tồn tại');
    });

    test('2.6 Ghế không tồn tại - trả về 404', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: 9999, // Non-existent chair
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Ghế không tồn tại');
    });

    test('2.7 Ghế không hoạt động - trả về 400', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair3.id, // Inactive chair
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('đang không hoạt động');
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 3. CONFLICT SCENARIOS - Time/Chair Conflicts
  // ══════════════════════════════════════════════════════════════

  describe('⚠️ Conflict Scenarios', () => {

    test('3.1 Ghế đã có lịch đặt trùng giờ - trả về 409', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // First booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Second booking at same time, same chair
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('đã có lịch');
    });

    test('3.2 Đặt lịch trùng 1 phần thời gian - trả về 409', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // First booking: 10:00 - 10:30 (30min haircut)
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Second booking: 10:15 - overlaps with first
      const conflictTime = new Date(tomorrow);
      conflictTime.setMinutes(15);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: conflictTime.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(409);
    });

    test('3.3 Đặt lịch ngay sau khi booking trước kết thúc - OK', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // First booking: 10:00 - 10:30
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id], // 30 min
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Second booking: 10:30 (right after first ends)
      const nextSlot = new Date(tomorrow);
      nextSlot.setMinutes(30);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: nextSlot.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(201);
    });

    test('3.4 Cùng thời gian, khác ghế - OK', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);

      // First booking on chair 1
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Second booking on chair 2 at same time
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair2.id,
        });

      expect(response.status).toBe(201);
    });

    test('3.5 Booking đã hủy không gây conflict', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(13, 0, 0, 0);

      // Create and cancel first booking
      const firstBooking = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Cancel it
      await request(app)
        .patch(`/api/bookings/${firstBooking.body.booking.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      // New booking at same time should succeed
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(201);
    });

    test('3.6 Tiệm đầy lịch (tất cả ghế bận) - trả về 409', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);

      // Book all available chairs (chair1 and chair2, chair3 is inactive)
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair2.id,
        });

      // Third booking - shop is full
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id, // Try to double book
        });

      expect(response.status).toBe(409);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 4. AUTHENTICATION & AUTHORIZATION
  // ══════════════════════════════════════════════════════════════

  describe('🔐 Authentication & Authorization', () => {

    test('4.1 Không có token - trả về 401', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(401);
    });

    test('4.2 Token không hợp lệ - trả về 401', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer invalid-token-here')
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(401);
    });

    test('4.3 Token hết hạn - trả về 401', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: testData.users.customer.id, role: 'customer', permissions: ['CreateBooking'] },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: new Date().toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      expect(response.status).toBe(401);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 5. MY BOOKINGS - Get User's Bookings
  // ══════════════════════════════════════════════════════════════

  describe('📋 My Bookings', () => {

    test('5.1 Lấy danh sách booking của tôi', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create a booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const response = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toBeDefined();
      expect(response.body.bookings.length).toBeGreaterThanOrEqual(1);
    });

    test('5.2 Danh sách rỗng khi chưa có booking', async () => {
      // Create a second customer with no bookings
      const newCustomer = await User.create({
        username: 'newcustomer',
        email: 'new@test.com',
        password: 'hashedpassword',
        fullName: 'New Customer',
        phone: '0999999999',
        role: 'customer',
      });
      const newToken = generateToken(newCustomer, ['CreateBooking', 'ViewBooking']);

      const response = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 6. CANCEL BOOKING
  // ══════════════════════════════════════════════════════════════

  describe('🚫 Cancel Booking', () => {

    test('6.1 Khách hủy booking của mình - OK', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const response = await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Huỷ lịch thành công');
    });

    test('6.2 Không thể hủy booking đã hoàn thành', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create booking
      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Mark as completed (staff/admin)
      await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'completed' });

      // Try to cancel
      const response = await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('đã hoàn thành');
    });

    test('6.3 Khách không thể hủy booking người khác', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create booking as customer
      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Another customer tries to cancel
      const otherCustomer = await User.create({
        username: 'othercustomer',
        email: 'other@test.com',
        password: 'hashedpassword',
        fullName: 'Other Customer',
        phone: '0888888888',
        role: 'customer',
      });
      const otherToken = generateToken(otherCustomer, ['CreateBooking']);

      const response = await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/cancel`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });

    test('6.4 Staff có thể hủy bất kỳ booking nào', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);

      // Create booking as customer
      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Staff cancels
      const response = await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/cancel`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
    });

    test('6.5 Hủy booking không tồn tại - trả về 404', async () => {
      const response = await request(app)
        .patch('/api/bookings/99999/cancel')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 7. STATUS MANAGEMENT
  // ══════════════════════════════════════════════════════════════

  describe('📊 Status Management', () => {

    test('7.1 Staff cập nhật trạng thái: pending → confirmed', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const response = await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.booking.status).toBe('confirmed');
    });

    test('7.2 Staff cập nhật trạng thái: confirmed → completed', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // First confirm
      await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'confirmed' });

      // Then complete
      const response = await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.booking.status).toBe('completed');
    });

    test('7.3 Admin có thể cập nhật trạng thái', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const response = await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 8. BUSY SLOTS API
  // ══════════════════════════════════════════════════════════════

  describe('📅 Busy Slots', () => {

    test('8.1 Lấy danh sách slot bận theo ngày', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create a booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const dateStr = tomorrow.toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/bookings/busy?date=${dateStr}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toBeDefined();
      expect(response.body.bookings.length).toBeGreaterThanOrEqual(1);
    });

    test('8.2 Thiếu tham số date - trả về 400', async () => {
      const response = await request(app)
        .get('/api/bookings/busy')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('date');
    });

    test('8.3 Booking đã hủy không hiển thị trong busy slots', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      // Create and cancel booking
      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      await request(app)
        .patch(`/api/bookings/${createRes.body.booking.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      const dateStr = tomorrow.toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/bookings/busy?date=${dateStr}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      // Cancelled booking should not appear
      const foundCancelled = response.body.bookings.find(
        (b) => b.id === createRes.body.booking.id
      );
      expect(foundCancelled).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 9. GET ALL BOOKINGS (Admin/Staff)
  // ══════════════════════════════════════════════════════════════

  describe('📚 Get All Bookings (Admin/Staff)', () => {

    test('9.1 Staff xem tất cả bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toBeDefined();
    });

    test('9.2 Lọc theo trạng thái', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Create a pending booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const response = await request(app)
        .get('/api/bookings?status=pending')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      response.body.bookings.forEach((booking) => {
        expect(booking.status).toBe('pending');
      });
    });

    test('9.3 Lọc theo ngày', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const dateStr = tomorrow.toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/bookings?date=${dateStr}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // 10. GET BOOKING BY ID
  // ══════════════════════════════════════════════════════════════

  describe('🔍 Get Booking By ID', () => {

    test('10.1 Staff xem chi tiết booking', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      const response = await request(app)
        .get(`/api/bookings/${createRes.body.booking.id}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.id).toBe(createRes.body.booking.id);
    });

    test('10.2 Khách chỉ xem được booking của mình', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Same customer can view
      const response = await request(app)
        .get(`/api/bookings/${createRes.body.booking.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
    });

    test('10.3 Khách không xem được booking người khác - trả về 403', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);

      const createRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [testData.services.haircut.id],
          startTime: tomorrow.toISOString(),
          chairId: testData.chairs.chair1.id,
        });

      // Another customer
      const anotherCustomer = await User.create({
        username: 'anothercustomer2',
        email: 'another2@test.com',
        password: 'hashedpassword',
        fullName: 'Another Customer 2',
        phone: '0777777777',
        role: 'customer',
      });
      const anotherToken = generateToken(anotherCustomer, ['CreateBooking', 'ViewBooking']);

      const response = await request(app)
        .get(`/api/bookings/${createRes.body.booking.id}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(response.status).toBe(403);
    });

    test('10.4 Booking không tồn tại - trả về 404', async () => {
      const response = await request(app)
        .get('/api/bookings/99999')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(404);
    });
  });
});
