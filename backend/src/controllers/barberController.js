const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Barber, Chair, Booking, Service } = require('../models');

const getAllBarbers = async (req, res) => {
  try {
    const barbers = await Barber.findAll({ include: [{ model: Chair, as: 'chair' }], order: [['name', 'ASC']] });
    return res.json({ barbers });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getBarberById = async (req, res) => {
  try {
    const barber = await Barber.findByPk(req.params.id, { include: [{ model: Chair, as: 'chair' }] });
    if (!barber) return res.status(404).json({ message: 'Thợ không tồn tại' });
    return res.json({ barber });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createBarber = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, experienceYears, chairId, phone, avatar, userId } = req.body;
    if (chairId) {
      const chair = await Chair.findByPk(chairId);
      if (!chair) return res.status(404).json({ message: 'Ghế không tồn tại' });
      const existingBarber = await Barber.findOne({ where: { chairId } });
      if (existingBarber) return res.status(409).json({ message: 'Ghế này đã có thợ phụ trách' });
    }
    const barber = await Barber.create({ name, experienceYears, chairId, phone, avatar, userId });
    return res.status(201).json({ message: 'Thêm thợ thành công', barber });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateBarber = async (req, res) => {
  try {
    const barber = await Barber.findByPk(req.params.id);
    if (!barber) return res.status(404).json({ message: 'Thợ không tồn tại' });
    const { name, experienceYears, chairId, phone, avatar, userId } = req.body;
    await barber.update({ name, experienceYears, chairId, phone, avatar, userId });
    return res.json({ message: 'Cập nhật thông tin thợ thành công', barber });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findByPk(req.params.id);
    if (!barber) return res.status(404).json({ message: 'Thợ không tồn tại' });
    await barber.destroy();
    return res.json({ message: 'Xóa thợ thành công' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getBarberSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const barber = await Barber.findByPk(req.params.id);
    if (!barber) return res.status(404).json({ message: 'Thợ không tồn tại' });

    const where = { barberId: req.params.id };
    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      where.startTime = { [Op.between]: [day, nextDay] };
      where.status = { [Op.notIn]: ['cancelled'] };
    }
    const bookings = await Booking.findAll({
      where,
      include: [{ model: Service, as: 'services' }],
      order: [['startTime', 'ASC']],
    });
    return res.json({ barber, schedule: bookings });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getMySchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const barber = await Barber.findOne({ where: { userId: req.user.id } });
    if (!barber) return res.status(404).json({ message: 'Tài khoản này chưa được liên kết với hồ sơ thợ nào' });

    const where = { barberId: barber.id };
    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      where.startTime = { [Op.between]: [day, nextDay] };
      where.status = { [Op.notIn]: ['cancelled'] };
    }
    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Service, as: 'services' },
        { model: require('../models').User, as: 'user', attributes: ['id', 'fullName', 'phone'] }
      ],
      order: [['startTime', 'ASC']],
    });
    return res.json({ barber, schedule: bookings });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAllBarbers, getBarberById, createBarber, updateBarber, deleteBarber, getBarberSchedule, getMySchedule };
