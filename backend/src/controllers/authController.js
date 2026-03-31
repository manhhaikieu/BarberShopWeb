const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { ROLE_PERMISSIONS } = require('../config/permissions');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password, fullName, phone, role } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email đã được sử dụng' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const assignedRole = req.user?.role === 'admin' && role ? role : 'customer';

    const user = await User.create({ username, email, password: hashedPassword, fullName, phone, role: assignedRole });
    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: { id: user.id, username: user.username, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    const token = jwt.sign(
      { id: user.id, role: user.role, permissions },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role, permissions },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getProfile = async (req, res) => {
  return res.json({ user: req.user, permissions: req.permissions });
};

const getStaffUsers = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: 'staff' },
      attributes: ['id', 'fullName', 'username', 'email']
    });
    return res.json({ staff });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { fullName, email, username } = req.body;
  try {
    const { Op } = require('sequelize');
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    const existing = await User.findOne({ 
        where: { 
            [Op.or]: [{ email }, { username }],
            id: { [Op.ne]: req.user.id }
        } 
    });
    
    if (existing) {
        if (existing.email === email) return res.status(409).json({ message: 'Email đã được sử dụng bởi người khác' });
        if (existing.username === username) return res.status(409).json({ message: 'Username đã được sử dụng bởi người khác' });
    }

    await user.update({ fullName, email, username });
    
    return res.json({
      message: 'Cập nhật thông tin thành công',
      user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role, permissions: req.user.permissions }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { register, login, getProfile, getStaffUsers, updateProfile };
