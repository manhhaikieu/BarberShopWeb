const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Booking, BookingService, Service, Chair, Barber, User } = require('../models');

const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { serviceIds, startTime, chairId, barberId, note } = req.body;
  try {
    // 1. Lấy danh sách dịch vụ và tính tổng thời gian + giá
    const services = await Service.findAll({ where: { id: serviceIds } });
    if (services.length !== serviceIds.length)
      return res.status(404).json({ message: 'Một hoặc nhiều dịch vụ không tồn tại' });

    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const start = new Date(startTime);
    const end = new Date(start.getTime() + totalDuration * 60 * 1000);

    // 2. Kiểm tra ghế tồn tại
    const chair = await Chair.findByPk(chairId);
    if (!chair) return res.status(404).json({ message: 'Ghế không tồn tại' });
    if (!chair.isAvailable) return res.status(400).json({ message: 'Ghế đang không hoạt động' });

    // 3. Kiểm tra ghế có bị đặt trùng giờ không
    const conflictOnChair = await Booking.count({
      where: {
        chairId,
        status: { [Op.notIn]: ['cancelled'] },
        startTime: { [Op.lt]: end },
        endTime: { [Op.gt]: start },
      },
    });
    if (conflictOnChair > 0) return res.status(409).json({ message: 'Ghế này đã có lịch tại thời điểm đó' });

    // 4. Kiểm tra tổng số ghế còn trống toàn tiệm
    const totalChairs = await Chair.count({ where: { isAvailable: true } });
    const totalActiveBookings = await Booking.count({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        startTime: { [Op.lt]: end },
        endTime: { [Op.gt]: start },
      },
    });
    if (totalActiveBookings >= totalChairs)
      return res.status(409).json({ message: 'Tiệm đã đầy lịch tại thời điểm này' });

    // Tự động tìm thợ của ghế này nếu không có barberId truyền lên
    let finalBarberId = barberId || null;
    if (!finalBarberId) {
       const assignedBarber = await Barber.findOne({ where: { chairId } });
       if (assignedBarber) finalBarberId = assignedBarber.id;
    }

    // 5. Tạo booking
    const booking = await Booking.create({
      userId: req.user.id,
      chairId,
      barberId: finalBarberId,
      startTime: start,
      endTime: end,
      totalPrice,
      note,
    });

    // 6. Lưu các dịch vụ vào BookingService
    await Promise.all(
      services.map((s) =>
        BookingService.create({ bookingId: booking.id, serviceId: s.id, priceAtBooking: s.price })
      )
    );

    const result = await Booking.findByPk(booking.id, {
      include: [
        { model: Service, as: 'services' },
        { model: Chair, as: 'chair' },
        { model: Barber, as: 'barber' },
      ],
    });
    return res.status(201).json({ message: 'Đặt lịch thành công', booking: result });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { date, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      where.startTime = { [Op.between]: [day, nextDay] };
    }
    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'phone'] },
        { model: Service, as: 'services' },
        { model: Chair, as: 'chair' },
        { model: Barber, as: 'barber' },
      ],
      order: [['startTime', 'ASC']],
    });
    return res.json({ bookings });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Service, as: 'services' },
        { model: Chair, as: 'chair' },
        { model: Barber, as: 'barber' },
      ],
      order: [['startTime', 'DESC']],
    });
    return res.json({ bookings });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'phone'] },
        { model: Service, as: 'services' },
        { model: Chair, as: 'chair' },
        { model: Barber, as: 'barber' },
      ],
    });
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });
    if (req.user.role === 'customer' && booking.userId !== req.user.id)
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    return res.json({ booking });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });
    await booking.update({ status });
    return res.json({ message: 'Cập nhật trạng thái thành công', booking });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });
    if (req.user.role === 'customer' && booking.userId !== req.user.id)
      return res.status(403).json({ message: 'Không có quyền huỷ booking này' });
    if (booking.status === 'completed')
      return res.status(400).json({ message: 'Không thể huỷ booking đã hoàn thành' });
    await booking.update({ status: 'cancelled' });
    return res.json({ message: 'Huỷ lịch thành công' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getBusySlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Thiếu tham số date' });
    const day = new Date(date);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const bookings = await Booking.findAll({
      where: {
        startTime: { [Op.between]: [day, nextDay] },
        status: { [Op.notIn]: ['cancelled'] },
      },
      attributes: ['id', 'startTime', 'endTime', 'chairId'],
    });
    return res.json({ bookings });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { createBooking, getAllBookings, getMyBookings, getBookingById, updateBookingStatus, cancelBooking, getBusySlots };
