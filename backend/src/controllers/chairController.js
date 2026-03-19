const { Chair, Barber } = require('../models');

const getAllChairs = async (req, res) => {
  try {
    const chairs = await Chair.findAll({ include: [{ model: Barber, as: 'barber' }] });
    return res.json({ chairs });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createChair = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên ghế là bắt buộc' });
    const chair = await Chair.create({ name });
    return res.status(201).json({ message: 'Thêm ghế thành công', chair });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateChair = async (req, res) => {
  try {
    const chair = await Chair.findByPk(req.params.id);
    if (!chair) return res.status(404).json({ message: 'Ghế không tồn tại' });
    await chair.update(req.body);
    return res.json({ message: 'Cập nhật ghế thành công', chair });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteChair = async (req, res) => {
  try {
    const chair = await Chair.findByPk(req.params.id);
    if (!chair) return res.status(404).json({ message: 'Ghế không tồn tại' });
    await chair.destroy();
    return res.json({ message: 'Xóa ghế thành công' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAllChairs, createChair, updateChair, deleteChair };
