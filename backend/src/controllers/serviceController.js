const { validationResult } = require('express-validator');
const { Service } = require('../models');

const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [['name', 'ASC']] });
    return res.json({ services });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    return res.json({ service });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, price, duration, description } = req.body;
    const service = await Service.create({ name, price, duration, description });
    return res.status(201).json({ message: 'Tạo dịch vụ thành công', service });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    await service.update(req.body);
    return res.json({ message: 'Cập nhật dịch vụ thành công', service });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    await service.destroy();
    return res.json({ message: 'Xóa dịch vụ thành công' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
