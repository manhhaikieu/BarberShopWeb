const { validationResult } = require('express-validator');
const { Product, ProductSale } = require('../models');

const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const products = await Product.findAll({ where, order: [['name', 'ASC']] });
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    return res.json({ product });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, price, stockQuantity, category, description, imageUrl } = req.body;
    const product = await Product.create({ name, price, stockQuantity, category, description, imageUrl });
    return res.status(201).json({ message: 'Tạo sản phẩm thành công', product });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    await product.update(req.body);
    return res.json({ message: 'Cập nhật sản phẩm thành công', product });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    await product.destroy();
    return res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const sellProduct = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    if (product.stockQuantity < quantity)
      return res.status(400).json({ message: 'Số lượng tồn kho không đủ' });

    const totalPrice = product.price * quantity;
    await product.update({ stockQuantity: product.stockQuantity - quantity });
    const sale = await ProductSale.create({ productId: product.id, userId: req.user.id, quantity, totalPrice });
    return res.status(201).json({ message: 'Bán hàng thành công', sale });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, sellProduct };
